import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getBookCoverUrl } from "@/lib/book-cover-url";
import { noStoreHeaders, requireAuthenticatedUser, requireLibrarian } from "@/lib/auth";
import {
  getClientIp,
  hasOnlyFields,
  isJsonContentType,
  isRecord,
  isUuid,
  normalizeText,
  parseEnum,
  parseBookCoverUrl,
  parseOptionalString,
  parsePagination,
  parseRequiredString,
  parseSearch,
} from "@/lib/validation";

export const runtime = "nodejs";
function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

async function withCoverUrl<T extends { coverUrl: string | null }>(book: T) {
  return { ...book, coverUrl: await getBookCoverUrl(book.coverUrl) };
}

const bookSelect = {
  id: true, isbn: true, title: true, isActive: true, publisher: true,
  publicationYear: true, edition: true, description: true, coverUrl: true,
  createdAt: true, updatedAt: true,
  category: { select: { id: true, name: true, ddcCode: true } },
  bookAuthors: { select: { author: { select: { id: true, name: true } } }, orderBy: { author: { name: "asc" as const } } },
  _count: { select: { copies: { where: { isActive: true } } } },
} as const;

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return errorResponse("Autentikasi diperlukan.", 401);

  const url = new URL(request.url);
  const pagination = parsePagination(url.searchParams);
  if (!pagination.ok) return errorResponse(pagination.error, 422);
  const searchResult = parseSearch(url.searchParams);
  if (!searchResult.ok) return errorResponse(searchResult.error, 422);
  const { page, limit } = pagination.value;
  const search = searchResult.value;
  const categoryId = url.searchParams.get("categoryId")?.trim() ?? "";
  const authorId = url.searchParams.get("authorId")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";
  const statusResult = status ? parseEnum(status, ["TERSEDIA", "DIPINJAM", "RUSAK", "HILANG"] as const, "Status buku") : null;

  if ((categoryId && !isUuid(categoryId)) || (authorId && !isUuid(authorId))) return errorResponse("ID filter tidak valid.", 422);
  if (statusResult && !statusResult.ok) return errorResponse(statusResult.error, 422);

  const where = {
    ...(auth.schoolId ? { schoolId: auth.schoolId } : {}),
    isActive: true,
    category: { is: { isActive: true } },
    ...(categoryId ? { categoryId } : {}),
    ...(authorId ? { bookAuthors: { some: { authorId } } } : {}),
    ...(statusResult?.ok ? { copies: { some: { status: statusResult.value } } } : {}),
    ...(search ? { OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { isbn: { contains: search, mode: "insensitive" as const } },
        { publisher: { contains: search, mode: "insensitive" as const } },
        { bookAuthors: { some: { author: { name: { contains: search, mode: "insensitive" as const } } } } },
        { category: { OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { ddcCode: { contains: search, mode: "insensitive" as const } },
        ] } },
      ] } : {}),
  };



  try {
    const [data, total] = await prisma.$transaction([
      prisma.book.findMany({ where: { ...where, schoolId: auth.schoolId }, select: bookSelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
      prisma.book.count({ where: { ...where, schoolId: auth.schoolId } }),
    ]);
    const books = await Promise.all(data.map(async ({ _count, ...book }) => ({
      ...(await withCoverUrl(book)),
      authors: (book as { authors?: { id: string; name: string }[] }).authors ?? book.bookAuthors?.map((ba) => ba.author) ?? [],
      copyCount: _count.copies,
    })));
    return NextResponse.json({ data: books, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, { headers: noStoreHeaders });
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

const ALLOWED_POST_FIELDS = [
  "isbn", "title", "publisher", "publicationYear", "pageCount", "edition",
  "description", "coverUrl", "categoryId", "categoryName", "category", "ddc",
  "authorIds", "authorName", "author", "shelf", "stock", "status", "isEbook", "fileUrl",
] as const;

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  if (!isJsonContentType(request)) return errorResponse("Content-Type harus application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }
  if (!isRecord(body) || !hasOnlyFields(body, ALLOWED_POST_FIELDS)) return errorResponse("Body request tidak valid.", 422);

  const titleResult = parseRequiredString(body.title, { field: "Judul", maxLength: 300 });
  if (!titleResult.ok) return errorResponse(titleResult.error, 422);

  const rawIsbn = typeof body.isbn === "string" ? normalizeText(body.isbn) || null : body.isbn === null ? null : undefined;
  if (rawIsbn !== undefined && rawIsbn !== null && (rawIsbn.length > 50 || !/^[0-9Xx-]{3,25}$/.test(rawIsbn))) {
    return errorResponse("Format ISBN tidak valid (harus 3-25 karakter angka, tanda hubung -, atau X).", 422);
  }
  const isbn = rawIsbn === undefined ? null : rawIsbn;

  const publisherResult = parseOptionalString(body.publisher, { field: "Penerbit", maxLength: 200 });
  if (!publisherResult.ok) return errorResponse(publisherResult.error, 422);

  const editionResult = parseOptionalString(body.edition, { field: "Edisi", maxLength: 100 });
  if (!editionResult.ok) return errorResponse(editionResult.error, 422);

  const descriptionResult = parseOptionalString(body.description, { field: "Deskripsi", maxLength: 5000 });
  if (!descriptionResult.ok) return errorResponse(descriptionResult.error, 422);

  const coverResult = parseBookCoverUrl(body.coverUrl, "URL sampul");
  if (!coverResult.ok) return errorResponse(coverResult.error, 422);

  const publicationYear = body.publicationYear === undefined || body.publicationYear === null ? null : Number(body.publicationYear);
  const validYear = publicationYear === null || (Number.isSafeInteger(publicationYear) && publicationYear >= 1000 && publicationYear <= new Date().getFullYear() + 1);
  if (!validYear) {
    return errorResponse(`Tahun terbit harus berupa angka antara 1000 dan ${new Date().getFullYear() + 1}.`, 422);
  }

  const pageCount = body.pageCount === undefined || body.pageCount === null ? null : Number(body.pageCount);
  const validPage = pageCount === null || (Number.isSafeInteger(pageCount) && pageCount >= 1 && pageCount <= 50000);
  if (!validPage) {
    return errorResponse("Jumlah halaman harus berupa angka antara 1 dan 50.000.", 422);
  }

  const rawAuthorIds = Array.isArray(body.authorIds) ? body.authorIds : undefined;
  if (rawAuthorIds && (!rawAuthorIds.length || rawAuthorIds.length > 20 || !rawAuthorIds.every(isUuid))) {
    return errorResponse("Daftar penulis tidak valid.", 422);
  }

  const rawCategoryId = typeof body.categoryId === "string" && body.categoryId.trim() ? body.categoryId.trim() : undefined;
  if (rawCategoryId && !isUuid(rawCategoryId)) {
    return errorResponse("ID kategori tidak valid.", 422);
  }

  const title = titleResult.value;
  const publisher = publisherResult.value ?? null;
  const edition = editionResult.value ?? null;
  const description = descriptionResult.value ?? null;
  const coverUrl = coverResult.value;

  try {
    const data = await prisma.$transaction(async (tx) => {
      // 1. Resolve Category
      let resolvedCategoryId = rawCategoryId;
      if (!resolvedCategoryId) {
        const catName = typeof body.categoryName === "string" && body.categoryName.trim()
          ? body.categoryName.trim()
          : typeof body.category === "string" && body.category.trim()
          ? body.category.trim()
          : "";
        if (catName) {
          const found = await tx.category.findFirst({
            where: { schoolId: auth.schoolId, name: { equals: catName, mode: "insensitive" } },
            select: { id: true },
          });
          if (found) {
            resolvedCategoryId = found.id;
          } else {
            const cleanDdc = typeof body.ddc === "string" && body.ddc.trim() ? body.ddc.trim().slice(0, 20) : "000";
            const createdCat = await tx.category.create({
              data: { schoolId: auth.schoolId, name: catName, ddcCode: cleanDdc },
              select: { id: true },
            });
            resolvedCategoryId = createdCat.id;
          }
        } else {
          const fallbackCat = await tx.category.findFirst({
            where: { schoolId: auth.schoolId, isActive: true },
            select: { id: true },
          });
          if (fallbackCat) resolvedCategoryId = fallbackCat.id;
        }
      }

      if (!resolvedCategoryId) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      const category = await tx.category.findFirst({
        where: { id: resolvedCategoryId, schoolId: auth.schoolId, isActive: true },
        select: { id: true },
      });
      if (!category) throw new Error("CATEGORY_NOT_FOUND");

      // 2. Resolve Authors
      let finalAuthorIds: string[] = [];
      if (rawAuthorIds && rawAuthorIds.length > 0) {
        finalAuthorIds = [...new Set(rawAuthorIds)];
        const existingAuthors = await tx.author.findMany({
          where: { id: { in: finalAuthorIds }, schoolId: auth.schoolId },
          select: { id: true },
        });
        if (existingAuthors.length !== finalAuthorIds.length) {
          throw new Error("AUTHOR_NOT_FOUND");
        }
      } else {
        const authorText = typeof body.authorName === "string" && body.authorName.trim()
          ? body.authorName.trim()
          : typeof body.author === "string" && body.author.trim()
          ? body.author.trim()
          : "";
        if (!authorText) {
          throw new Error("AUTHOR_NOT_FOUND");
        }

        const authorNames = authorText.split(/[,&]/).map((n: string) => n.trim()).filter(Boolean);
        for (const name of authorNames) {
          const existing = await tx.author.findFirst({
            where: { schoolId: auth.schoolId, name: { equals: name, mode: "insensitive" } },
            select: { id: true },
          });
          if (existing) {
            finalAuthorIds.push(existing.id);
          } else {
            const created = await tx.author.create({
              data: { schoolId: auth.schoolId, name },
              select: { id: true },
            });
            finalAuthorIds.push(created.id);
          }
        }
        finalAuthorIds = [...new Set(finalAuthorIds)];
      }

      if (!finalAuthorIds.length) {
        throw new Error("AUTHOR_NOT_FOUND");
      }

      // 3. Create Book
      const book = await tx.book.create({
        data: {
          schoolId: auth.schoolId,
          isbn,
          title,
          publisher,
          publicationYear,
          pageCount,
          edition,
          description,
          coverUrl,
          categoryId: resolvedCategoryId,
        },
        select: { id: true },
      });

      // Link Authors explicitly to avoid nested composite relation issue
      await tx.bookAuthor.createMany({
        data: finalAuthorIds.map((authorId) => ({
          bookId: book.id,
          authorId,
          schoolId: auth.schoolId,
        })),
      });

      // 4. Handle initial physical copies (stock & shelf) if provided
      const stockNumber = Number(body.stock);
      if (!body.isEbook && Number.isSafeInteger(stockNumber) && stockNumber > 0) {
        let shelfId: string | null = null;
        const shelfText = typeof body.shelf === "string" ? body.shelf.trim() : "";
        if (shelfText) {
          const shelfCode = shelfText.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 30) || "RAK-01";
          const existingShelf = await tx.shelf.findFirst({
            where: { schoolId: auth.schoolId, OR: [{ code: shelfCode }, { name: shelfText }] },
            select: { id: true },
          });
          if (existingShelf) {
            shelfId = existingShelf.id;
          } else {
            const createdShelf = await tx.shelf.create({
              data: { schoolId: auth.schoolId, code: shelfCode, name: shelfText },
              select: { id: true },
            });
            shelfId = createdShelf.id;
          }
        }

        const copiesCount = Math.min(stockNumber, 100);
        const prefix = (isbn ? isbn.replace(/[^0-9A-Z]/gi, "").slice(-4) : book.id.slice(0, 4)).toUpperCase();
        const randSuffix = randomBytes(3).toString("hex").toUpperCase();
        for (let i = 1; i <= copiesCount; i++) {
          const barcode = `BK-${prefix}-${randSuffix}-${i}`;
          await tx.bookCopy.create({
            data: {
              schoolId: auth.schoolId,
              bookId: book.id,
              shelfId,
              barcode,
              status: "TERSEDIA",
              isActive: true,
            },
          });
        }
      }

      // Query final book state with relations and count
      const createdBook = await tx.book.findFirstOrThrow({
        where: { id: book.id, schoolId: auth.schoolId },
        select: bookSelect,
      });

      await tx.auditLog.create({
        data: {
          schoolId: auth.schoolId,
          userId: auth.user.id,
          action: "CREATE",
          entityType: "Book",
          entityId: book.id,
          newData: jsonValue(createdBook),
          ipAddress: getClientIp(request),
        },
      });

      return createdBook;
    });

    return NextResponse.json({ data: await withCoverUrl(data) }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    console.error("POST /api/buku ERROR:", error);
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") return errorResponse("Kategori tidak ditemukan.", 422);
    if (error instanceof Error && error.message === "AUTHOR_NOT_FOUND") return errorResponse("Salah satu penulis tidak ditemukan.", 422);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      const target = (error as { meta?: { target?: string[] | string } }).meta?.target;
      const targetStr = Array.isArray(target) ? target.join(",") : String(target || "");
      if (targetStr.includes("isbn")) return errorResponse("ISBN sudah digunakan oleh buku lain.", 409);
      if (targetStr.includes("ddcCode")) return errorResponse("Kode DDC sudah digunakan oleh kategori lain.", 409);
      if (targetStr.includes("barcode")) return errorResponse("Barcode eksemplar bertabrakan, silakan coba simpan lagi.", 409);
      return errorResponse("Data duplikat terdeteksi pada sistem.", 409);
    }
    const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    return errorResponse(`Terjadi kesalahan pada server: ${errMsg}`, 500);
  }
}
