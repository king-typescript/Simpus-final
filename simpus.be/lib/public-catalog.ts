import { prisma } from "@/lib/prisma";
import { Prisma } from "../app/generated/prisma/client";
import { getBookCoverUrl } from "@/lib/book-cover-url";

const PUBLIC_BOOK_SELECT = {
  id: true,
  title: true,
  coverUrl: true,
  description: true,
  publicationYear: true,
  category: { select: { id: true, name: true, ddcCode: true } },
  bookAuthors: { select: { author: { select: { id: true, name: true } } } },
} as const;

export async function getPublicBooks({
  page,
  limit,
  search,
  ddc,
}: {
  page: number;
  limit: number;
  search?: string;
  ddc?: string;
}) {
  const where: Prisma.BookWhereInput = {
    isActive: true,
    school: { isActive: true },
    category: { is: { isActive: true } },
  };

  const categoryFilter: Prisma.CategoryWhereInput = { isActive: true };
  if (ddc) {
    categoryFilter.ddcCode = { equals: ddc, mode: "insensitive" };
  }

  where.category = { is: categoryFilter };

  if (search) {
    const searchOr: Prisma.BookWhereInput[] = [
      { title: { contains: search, mode: "insensitive" } },
      { publisher: { contains: search, mode: "insensitive" } },
      { bookAuthors: { some: { author: { name: { contains: search, mode: "insensitive" } } } } },
      {
        category: {
          is: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { ddcCode: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
    where.OR = searchOr;
  }

  let books: Array<{
    id: string;
    title: string;
    coverUrl: string | null;
    description: string | null;
    publicationYear: number | null;
    category: { id: string; name: string; ddcCode: string };
    bookAuthors: Array<{ author: { id: string; name: string } }>;
  }> = [];

  if (!search && page === 1) {
    try {
      const rawIds = await prisma.$queryRaw<{ id: string }[]>`
        SELECT b.id FROM books b
        INNER JOIN schools s ON b."schoolId" = s.id
        INNER JOIN categories c ON b."categoryId" = c.id AND b."schoolId" = c."schoolId"
        WHERE b."isActive" = true AND s."isActive" = true AND c."isActive" = true
        ${ddc ? Prisma.sql`AND LOWER(c."ddcCode") = LOWER(${ddc})` : Prisma.empty}
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;

      if (rawIds.length > 0) {
        const ids = rawIds.map((r) => r.id);
        const fetched = await prisma.book.findMany({
          where: { id: { in: ids } },
          select: PUBLIC_BOOK_SELECT,
        });
        const idMap = new Map(fetched.map((b) => [b.id, b]));
        books = ids.map((id) => idMap.get(id)).filter(Boolean) as typeof fetched;
      }
    } catch {
      // Fallback to standard query if raw query cannot execute
      books = await prisma.book.findMany({
        where,
        select: PUBLIC_BOOK_SELECT,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
      });
    }
  } else {
    books = await prisma.book.findMany({
      where,
      select: PUBLIC_BOOK_SELECT,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  const total = await prisma.book.count({ where });

  const mapped = await Promise.all(
    books.map(async (b) => ({
      id: b.id,
      title: b.title,
      coverUrl: await getBookCoverUrl(b.coverUrl),
      description: b.description ? b.description.slice(0, 300) : null,
      publicationYear: b.publicationYear,
      category: b.category,
      authors: b.bookAuthors?.map((ba) => ba.author) ?? [],
    }))
  );

  return { data: mapped, total };
}

export async function getPublicCategories({
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const where: Prisma.CategoryWhereInput = {
    isActive: true,
    school: { isActive: true },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { ddcCode: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.category.findMany({
    where,
    select: { id: true, name: true, ddcCode: true },
    orderBy: [{ name: "asc" }, { ddcCode: "asc" }],
    take: 100,
  });

  const seen = new Set<string>();
  const uniqueCategories: { id: string; name: string; ddcCode: string }[] = [];
  for (const cat of categories) {
    const key = `${cat.ddcCode}-${cat.name.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCategories.push(cat);
    }
  }

  return { data: uniqueCategories, total: uniqueCategories.length };
}

