import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBookCoverUrl } from "@/lib/book-cover-url";
import { deleteBookCover } from "@/lib/book-cover-storage";
import { noStoreHeaders, requireAuthenticatedUser, requireLibrarian } from "@/lib/auth";
import {
  getClientIp,
  hasOnlyFields,
  isJsonContentType,
  isRecord,
  isUuid,
  normalizeText,
  parseBookCoverUrl,
  parseOptionalString,
  parseRequiredString,
} from "@/lib/validation";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}
function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}


const detailSelect = {
  id: true, isbn: true, title: true, isActive: true, publisher: true, publicationYear: true,
  edition: true, description: true, coverUrl: true, createdAt: true, updatedAt: true,
  category: { select: { id: true, name: true, ddcCode: true, description: true } },
  bookAuthors: { select: { author: { select: { id: true, name: true } } }, orderBy: { author: { name: "asc" as const } } },
  copies: { select: { id: true, barcode: true, status: true, conditionNote: true, acquiredAt: true, shelf: { select: { id: true, code: true, name: true, location: true } } }, orderBy: { barcode: "asc" as const } },
} as const;

export async function GET(_request: Request, context: Context) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return errorResponse("Autentikasi diperlukan.", 401);
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID buku tidak valid.", 422);
  try {
    const data = await prisma.book.findFirst({ where: { id, schoolId: auth.schoolId, isActive: true, category: { is: { isActive: true } } }, select: detailSelect });
    if (!data) return errorResponse("Buku tidak ditemukan.", 404);
    return NextResponse.json({ data: { ...data, authors: (data as { authors?: { id: string; name: string }[] }).authors ?? data.bookAuthors?.map((ba) => ba.author) ?? [], coverUrl: await getBookCoverUrl(data.coverUrl) } }, { headers: noStoreHeaders });
  } catch { return errorResponse("Terjadi kesalahan pada server.", 500); }
}

const ALLOWED_PATCH_FIELDS = [
  "isbn", "title", "publisher", "publicationYear", "pageCount", "edition",
  "description", "coverUrl", "categoryId", "categoryName", "category", "ddc",
  "authorIds", "authorName", "author", "shelf", "stock", "status", "isEbook", "fileUrl",
] as const;

export async function PATCH(request: Request, context: Context) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID buku tidak valid.", 422);
  if (!isJsonContentType(request)) return errorResponse("Content-Type harus application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }
  if (!isRecord(body) || !hasOnlyFields(body, ALLOWED_PATCH_FIELDS)) return errorResponse("Body request tidak valid.", 422);

  const data: {
    isbn?: string | null;
    title?: string;
    publisher?: string | null;
    publicationYear?: number | null;
    pageCount?: number | null;
    edition?: string | null;
    description?: string | null;
    coverUrl?: string | null;
    categoryId?: string;
  } = {};

  if ("isbn" in body) {
    if (body.isbn !== null && typeof body.isbn !== "string") return errorResponse("ISBN tidak valid.", 422);
    const value = typeof body.isbn === "string" ? normalizeText(body.isbn) || null : null;
    if (value !== null && value.length > 50) return errorResponse("ISBN tidak valid.", 422);
    data.isbn = value;
  }
  if ("title" in body) {
    const result = parseRequiredString(body.title, { field: "Judul", maxLength: 300 });
    if (!result.ok) return errorResponse(result.error, 422);
    data.title = result.value;
  }
  const optionalFields = [
    ["publisher", 200],
    ["edition", 100],
    ["description", 5000],
  ] as const;
  for (const [field, maxLength] of optionalFields) {
    if (field in body) {
      const result = parseOptionalString(body[field], { field, maxLength });
      if (!result.ok) return errorResponse(result.error, 422);
      data[field] = result.value ?? null;
    }
  }
  if ("coverUrl" in body) {
    const result = parseBookCoverUrl(body.coverUrl, "URL sampul");
    if (!result.ok) return errorResponse(result.error, 422);
    data.coverUrl = result.value;
  }
  if ("publicationYear" in body) {
    if (body.publicationYear !== null && (typeof body.publicationYear !== "number" || !Number.isSafeInteger(body.publicationYear) || body.publicationYear < 1000 || body.publicationYear > new Date().getFullYear() + 1)) return errorResponse("Tahun terbit tidak valid.", 422);
    data.publicationYear = body.publicationYear as number | null;
  }
  if ("pageCount" in body) {
    if (body.pageCount !== null && (typeof body.pageCount !== "number" || !Number.isSafeInteger(body.pageCount) || body.pageCount < 1 || body.pageCount > 50000)) return errorResponse("Jumlah halaman tidak valid.", 422);
    data.pageCount = body.pageCount as number | null;
  }
  if ("categoryId" in body) {
    if (body.categoryId && !isUuid(body.categoryId)) return errorResponse("Category ID tidak valid.", 422);
    if (body.categoryId) data.categoryId = body.categoryId as string;
  }

  const rawAuthorIds = "authorIds" in body ? body.authorIds : undefined;
  if (rawAuthorIds !== undefined && (!Array.isArray(rawAuthorIds) || !rawAuthorIds.length || rawAuthorIds.length > 20 || !rawAuthorIds.every(isUuid))) return errorResponse("Daftar penulis tidak valid.", 422);

  const hasAuthorText = (typeof body.authorName === "string" && body.authorName.trim()) || (typeof body.author === "string" && body.author.trim());
  if (!Object.keys(data).length && rawAuthorIds === undefined && !hasAuthorText) return errorResponse("Tidak ada perubahan.", 422);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.book.findFirst({ where: { id, schoolId: auth.schoolId, isActive: true }, select: detailSelect });
      if (!current) return null;
      if (data.categoryId && !(await tx.category.findFirst({ where: { id: data.categoryId, schoolId: auth.schoolId, isActive: true }, select: { id: true } }))) throw new Error("CATEGORY_NOT_FOUND");

      let uniqueAuthors: string[] | undefined = rawAuthorIds === undefined ? undefined : [...new Set(rawAuthorIds)];
      if (uniqueAuthors) {
        const count = await tx.author.count({ where: { id: { in: uniqueAuthors }, schoolId: auth.schoolId } });
        if (count !== uniqueAuthors.length) throw new Error("AUTHOR_NOT_FOUND");
      } else if (hasAuthorText) {
        const authorText = (typeof body.authorName === "string" && body.authorName.trim()) || (typeof body.author === "string" && body.author.trim()) || "";
        const authorNames = authorText.split(/[,&]/).map((n: string) => n.trim()).filter(Boolean);
        const resolvedIds: string[] = [];
        for (const name of authorNames) {
          const existing = await tx.author.findFirst({
            where: { schoolId: auth.schoolId, name: { equals: name, mode: "insensitive" } },
            select: { id: true },
          });
          if (existing) {
            resolvedIds.push(existing.id);
          } else {
            const created = await tx.author.create({
              data: { schoolId: auth.schoolId, name },
              select: { id: true },
            });
            resolvedIds.push(created.id);
          }
        }
        if (resolvedIds.length) uniqueAuthors = resolvedIds;
      }

      if (uniqueAuthors && tx.bookAuthor) {
        await tx.bookAuthor.deleteMany({ where: { bookId: id, ...(auth.schoolId ? { schoolId: auth.schoolId } : {}) } });
        await tx.bookAuthor.createMany({
          data: uniqueAuthors.map((authorId) => ({ bookId: id, authorId, schoolId: auth.schoolId })),
        });
      }

      const book = await tx.book.update({
        where: { id, schoolId: auth.schoolId },
        data,
        select: detailSelect,
      });

      await tx.auditLog.create({
        data: {
          schoolId: auth.schoolId,
          userId: auth.user.id,
          action: "UPDATE",
          entityType: "Book",
          entityId: id,
          oldData: jsonValue(current),
          newData: jsonValue(book),
          ipAddress: getClientIp(request),
        },
      });

      return { book, previousCoverUrl: current.coverUrl };
    });

    if (!result) return errorResponse("Buku tidak ditemukan.", 404);
    if ("coverUrl" in data && data.coverUrl !== result.previousCoverUrl) {
      await deleteBookCover(result.previousCoverUrl);
    }
    return NextResponse.json({ data: { ...result.book, authors: (result.book as { authors?: { id: string; name: string }[] }).authors ?? result.book.bookAuthors?.map((ba) => ba.author) ?? [], coverUrl: await getBookCoverUrl(result.book.coverUrl) } }, { headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") return errorResponse("Kategori tidak ditemukan.", 422);
    if (error instanceof Error && error.message === "AUTHOR_NOT_FOUND") return errorResponse("Salah satu penulis tidak ditemukan.", 422);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return errorResponse("ISBN sudah digunakan.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID buku tidak valid.", 422);
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const current = await tx.book.findFirst({ where: { id, schoolId: auth.schoolId, isActive: true }, select: detailSelect });
      if (!current) return false;
      await tx.book.update({ where: { id, schoolId: auth.schoolId }, data: { isActive: false } });
      await tx.auditLog.create({ data: { schoolId: auth.schoolId, userId: auth.user.id, action: "DEACTIVATE", entityType: "Book", entityId: id, oldData: jsonValue(current), newData: jsonValue({ ...current, isActive: false }), ipAddress: getClientIp(request) } });
      return true;
    });
    return deleted ? new NextResponse(null, { status: 204 }) : errorResponse("Buku tidak ditemukan.", 404);
  } catch { return errorResponse("Terjadi kesalahan pada server.", 500); }
}
