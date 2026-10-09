import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createBookSchema = z.object({
  title: z.string().trim().min(1, "Judul buku wajib diisi").max(300, "Judul terlalu panjang"),
  isbn: z.string().trim().max(20).nullable().optional(),
  publisher: z.string().trim().max(200).nullable().optional(),
  edition: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  coverUrl: z.string().max(2048).nullable().optional(),
  fileUrl: z.string().max(2048).nullable().optional(),
  isEbook: z.boolean().optional(),
  pageCount: z.coerce.number().int().min(1).max(50000).nullable().optional(),
  shelf: z.string().trim().max(100).nullable().optional(),
  categoryId: z.string().uuid("ID kategori tidak valid").optional(),
  categoryName: z.string().trim().min(1).optional(),
  authorIds: z.array(z.string().uuid("ID penulis tidak valid")).max(20).optional(),
  authorName: z.string().trim().min(1).optional(),
  publicationYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).nullable().optional(),
  stock: z.coerce.number().int().min(0).max(1000).optional(),
});

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function uuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function integer(value: string | null, fallback: number, maximum = 1000) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

const bookSelect = {
  id: true,
  isbn: true,
  title: true,
  isActive: true,
  publisher: true,
  publicationYear: true,
  pageCount: true,
  isEbook: true,
  fileUrl: true,
  edition: true,
  description: true,
  coverUrl: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, ddcCode: true } },
  authors: { select: { id: true, name: true }, orderBy: { name: "asc" as const } },
  copies: {
    where: { isActive: true },
    select: {
      id: true,
      barcode: true,
      status: true,
      shelf: { select: { id: true, code: true, name: true, location: true } },
    },
    take: 1,
  },
  _count: { select: { copies: { where: { isActive: true } } } },
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = integer(url.searchParams.get("page"), 1, 10000);
  const limit = Math.min(integer(url.searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT), MAX_LIMIT);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const categoryId = url.searchParams.get("categoryId")?.trim() ?? "";
  const authorId = url.searchParams.get("authorId")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";
  const type = url.searchParams.get("type")?.trim() ?? "";
  const sort = url.searchParams.get("sort")?.trim() ?? "";
  const statuses = ["TERSEDIA", "DIPINJAM", "RUSAK", "HILANG"] as const;

  if ((categoryId && !uuid(categoryId)) || (authorId && !uuid(authorId))) return errorResponse("ID filter tidak valid.", 422);
  if (status && !statuses.includes(status as (typeof statuses)[number])) return errorResponse("Status buku tidak valid.", 422);

  const andConditions: Record<string, unknown>[] = [
    { isActive: true },
    { category: { is: { isActive: true } } },
  ];
  if (type === "EBOOK") andConditions.push({ isEbook: true });
  else if (type === "FISIK") andConditions.push({ isEbook: false });
  if (categoryId) andConditions.push({ categoryId });
  if (authorId) andConditions.push({ authors: { some: { id: authorId } } });
  if (status) {
    if (status === "TERSEDIA") {
      andConditions.push({
        OR: [
          { isEbook: true },
          { copies: { some: { status: "TERSEDIA" as const, isActive: true } } },
        ],
      });
    } else {
      andConditions.push({ copies: { some: { status: status as (typeof statuses)[number], isActive: true } } });
    }
  }
  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { isbn: { contains: search, mode: "insensitive" as const } },
        { publisher: { contains: search, mode: "insensitive" as const } },
        { authors: { some: { name: { contains: search, mode: "insensitive" as const } } } },
        { category: { OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { ddcCode: { contains: search, mode: "insensitive" as const } },
        ] } },
      ],
    });
  }

  const where = { AND: andConditions };

  try {
    if (sort === "popular") {
      const allMatching = await prisma.book.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          copies: {
            where: { isActive: true },
            select: { loanItems: { select: { id: true } } },
          },
        },
      });
      const scored = allMatching.map((b) => ({
        id: b.id,
        score: b.copies.reduce((acc: number, c: { loanItems: { id: string }[] }) => acc + c.loanItems.length, 0),
        createdAt: b.createdAt,
      }));
      scored.sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime());
      const total = scored.length;
      const pagedIds = scored.slice((page - 1) * limit, page * limit).map((s) => s.id);
      const data = pagedIds.length
        ? await prisma.book.findMany({
            where: { id: { in: pagedIds } },
            select: bookSelect,
          })
        : [];
      const ordered = pagedIds.map((id) => data.find((d) => d.id === id)).filter(Boolean) as typeof data;
      const formatted = ordered.map(({ _count, copies, ...book }) => {
        const firstShelf = (copies as { shelf?: { name?: string; code?: string } }[] | undefined)?.[0]?.shelf?.name
          || (copies as { shelf?: { name?: string; code?: string } }[] | undefined)?.[0]?.shelf?.code
          || null;
        return {
          ...book,
          shelf: firstShelf,
          copyCount: (_count as { copies: number }).copies,
        };
      });
      return NextResponse.json(
        { data: formatted, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
        { headers: noStoreHeaders }
      );
    }

    const [data, total] = await prisma.$transaction([
      prisma.book.findMany({
        where,
        select: bookSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    const formatted = data.map(({ _count, copies, ...book }) => {
      const firstShelf = copies?.[0]?.shelf?.name || copies?.[0]?.shelf?.code || null;
      return {
        ...book,
        shelf: firstShelf,
        copyCount: _count.copies,
      };
    });

    return NextResponse.json(
      { data: formatted, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
      { headers: noStoreHeaders }
    );
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }

  const parseResult = createBookSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data buku tidak valid.", 422);
  }

  const {
    title,
    isbn = null,
    publisher = null,
    edition = null,
    description = null,
    coverUrl = null,
    fileUrl = null,
    isEbook = false,
    pageCount = null,
    shelf = null,
    categoryId,
    categoryName,
    authorIds = [],
    authorName,
    publicationYear = null,
    stock = 0,
  } = parseResult.data;

  try {
    const data = await prisma.$transaction(async (tx) => {
      // 1. Resolve Category
      let finalCategoryId = categoryId;
      if (!finalCategoryId) {
        if (categoryName) {
          const existingCategory = await tx.category.findFirst({
            where: { name: { equals: categoryName, mode: "insensitive" } },
          });
          if (existingCategory) {
            finalCategoryId = existingCategory.id;
          } else {
            const createdCat = await tx.category.create({
              data: {
                name: categoryName,
                ddcCode: Math.floor(100 + Math.random() * 900).toString(),
                isActive: true,
              },
            });
            finalCategoryId = createdCat.id;
          }
        } else {
          const defaultCat = await tx.category.findFirst({ where: { isActive: true } });
          if (!defaultCat) throw new Error("CATEGORY_NOT_FOUND");
          finalCategoryId = defaultCat.id;
        }
      }

      // 2. Resolve Authors
      const finalAuthorIds = [...authorIds];
      if (authorName) {
        let existingAuthor = await tx.author.findFirst({
          where: { name: { equals: authorName, mode: "insensitive" } },
        });
        if (!existingAuthor) {
          existingAuthor = await tx.author.create({ data: { name: authorName } });
        }
        if (!finalAuthorIds.includes(existingAuthor.id)) {
          finalAuthorIds.push(existingAuthor.id);
        }
      }

      if (finalAuthorIds.length === 0) {
        let defaultAuthor = await tx.author.findFirst();
        if (!defaultAuthor) {
          defaultAuthor = await tx.author.create({ data: { name: "Penulis Anonim" } });
        }
        finalAuthorIds.push(defaultAuthor.id);
      }

      const uniqueAuthorIds = [...new Set(finalAuthorIds)];

      // 3. Resolve Shelf (if provided)
      let resolvedShelfId: string | null = null;
      const cleanShelf = shelf?.trim();
      if (cleanShelf && !isEbook) {
        let existingShelf = await tx.shelf.findFirst({
          where: {
            OR: [
              { code: { equals: cleanShelf, mode: "insensitive" } },
              { name: { equals: cleanShelf, mode: "insensitive" } },
            ],
          },
        });
        if (!existingShelf) {
          existingShelf = await tx.shelf.create({
            data: {
              code: cleanShelf.toUpperCase().replace(/\s+/g, "-"),
              name: cleanShelf,
            },
          });
        }
        resolvedShelfId = existingShelf.id;
      }

      // 4. Create Book
      const book = await tx.book.create({
        data: {
          isbn: isbn || null,
          title,
          publisher: publisher || null,
          publicationYear: publicationYear ?? null,
          pageCount: pageCount ?? null,
          isEbook: Boolean(isEbook),
          fileUrl: fileUrl || null,
          edition: edition || null,
          description: description || null,
          coverUrl: coverUrl || null,
          categoryId: finalCategoryId,
          authors: { connect: uniqueAuthorIds.map((id) => ({ id })) },
        },
      });

      // 5. Create Copies (Physical Books)
      const effectiveStock = isEbook ? 0 : stock;
      if (effectiveStock > 0) {
        const copiesData = Array.from({ length: effectiveStock }).map((_, i) => ({
          bookId: book.id,
          shelfId: resolvedShelfId,
          barcode: `BC-${Date.now().toString().slice(-6)}-${i + 1}`,
          status: "TERSEDIA" as const,
          isActive: true,
          acquiredAt: new Date(),
        }));
        await tx.bookCopy.createMany({ data: copiesData });
      }

      const bookRecord = await tx.book.findUnique({
        where: { id: book.id },
        select: bookSelect,
      });

      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "CREATE",
          entityType: "Book",
          entityId: book.id,
          newData: jsonValue(bookRecord),
        },
      });

      return {
        ...bookRecord,
        shelf: cleanShelf || null,
        copyCount: effectiveStock,
      };
    });

    return NextResponse.json({ data }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") return errorResponse("Kategori tidak ditemukan.", 422);
    if (error instanceof Error && error.message === "AUTHOR_NOT_FOUND") return errorResponse("Salah satu penulis tidak ditemukan.", 422);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return errorResponse("ISBN sudah digunakan.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
