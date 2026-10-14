import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoanRequestStatus } from "@/app/generated/prisma/client";
import { noStoreHeaders, requireStudent } from "@/lib/auth";
import {
  getClientIp,
  hasOnlyFields,
  isJsonContentType,
  isRecord,
  isUuid,
  parseOptionalString,
} from "@/lib/validation";

export const runtime = "nodejs";

const ACTIVE_REQUEST_STATUSES: LoanRequestStatus[] = [
  LoanRequestStatus.MENUNGGU_KONFIRMASI,
  LoanRequestStatus.DISETUJUI,
];

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

function todayAtFivePmJakarta(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day"), 10));
}

async function serializable<T>(operation: () => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      const conflict = typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
      if (!conflict || attempt === 2) throw error;
    }
  }
  throw new Error("TRANSACTION_CONFLICT");
}

function parsePagination(request: Request) {
  const url = new URL(request.url);
  const pageValue = url.searchParams.get("page") ?? "1";
  const limitValue = url.searchParams.get("limit") ?? "20";
  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (!/^\\d+$/.test(pageValue) || !/^\\d+$/.test(limitValue) || !Number.isSafeInteger(page) || !Number.isSafeInteger(limit) || page < 1 || limit < 1 || limit > 100) {
    return null;
  }

  return { page, limit, skip: (page - 1) * limit };
}

export async function GET(request: Request) {
  const auth = await requireStudent();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  const pagination = parsePagination(request);
  if (!pagination) return errorResponse("Parameter pagination tidak valid.", 422);

  try {
    const where = {
      schoolId: auth.schoolId,
      studentId: auth.student.id,
    } as const;

    const [total, requests] = await Promise.all([
      prisma.loanRequest.count({ where }),
      prisma.loanRequest.findMany({
        where,
        orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          status: true,
          requestedAt: true,
          expiresAt: true,
          confirmedAt: true,
          dueDate: true,
          notes: true,
          rejectionNote: true,
          items: {
            orderBy: { id: "asc" },
            select: {
              id: true,
              book: {
                select: {
                  id: true,
                  title: true,
                  isbn: true,
                  coverUrl: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: requests,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    }, { status: 200, headers: noStoreHeaders });
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireStudent();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  if (!isJsonContentType(request)) return errorResponse("Content-Type harus application/json.", 415);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }

  if (!isRecord(body) || !hasOnlyFields(body, ["bookIds", "notes"])) {
    return errorResponse("Body request tidak valid.", 422);
  }

  const bookIds = body.bookIds;
  const notesResult = parseOptionalString(body.notes, { field: "Catatan", maxLength: 1000 });
  if (!Array.isArray(bookIds) || bookIds.length === 0 || !bookIds.every(isUuid) || new Set(bookIds).size !== bookIds.length || !notesResult.ok) {
    return errorResponse("Data pengajuan tidak valid.", 422);
  }

  const expiresAt = todayAtFivePmJakarta();
  if (expiresAt.getTime() <= Date.now()) {
    return errorResponse("Pengajuan hanya dapat dilakukan sebelum pukul 17:00.", 422);
  }

  try {
    const created = await serializable(() => prisma.$transaction(async (tx) => {
      const settings = await tx.librarySetting.findUnique({
        where: { schoolId: auth.schoolId },
        select: { maxActiveCopies: true },
      });
      if (!settings) throw new Error("SETTINGS_NOT_FOUND");
      if (bookIds.length > settings.maxActiveCopies) throw new Error("BOOK_LIMIT_EXCEEDED");

      const student = await tx.student.findFirst({
        where: { id: auth.student.id, schoolId: auth.schoolId, isActive: true, user: { status: "AKTIF" } },
        select: { id: true },
      });
      if (!student) throw new Error("STUDENT_NOT_FOUND");

      const books = await tx.book.findMany({
        where: {
          schoolId: auth.schoolId,
          id: { in: bookIds },
          isActive: true,
          category: { is: { isActive: true } },
        },
        select: {
          id: true,
          copies: {
            where: { schoolId: auth.schoolId, isActive: true, status: "TERSEDIA" },
            select: { id: true },
            take: 1,
          },
        },
      });
      if (books.length !== bookIds.length || books.some((book) => book.copies.length === 0)) {
        throw new Error("BOOK_NOT_AVAILABLE");
      }

      const activeLoanItems = await tx.loanItem.count({
        where: {
          schoolId: auth.schoolId,
          returnedAt: null,
          loan: {
            studentId: student.id,
            schoolId: auth.schoolId,
            status: { in: ["AKTIF", "SEBAGIAN_DIKEMBALIKAN"] },
          },
        },
      });

      const activeRequests = await tx.loanRequest.findMany({
        where: {
          schoolId: auth.schoolId,
          studentId: student.id,
          status: { in: ACTIVE_REQUEST_STATUSES },
          expiresAt: { gt: new Date() },
        },
        select: {
          items: { select: { bookId: true } },
        },
      });
      const activeBookIds = new Set(activeRequests.flatMap((request) => request.items.map((item) => item.bookId)));
      if (bookIds.some((bookId) => activeBookIds.has(bookId))) throw new Error("DUPLICATE_ACTIVE_REQUEST");

      const activeRequestItems = activeRequests.reduce((count, request) => count + request.items.length, 0);
      if (activeLoanItems + activeRequestItems + bookIds.length > settings.maxActiveCopies) {
        throw new Error("ACTIVE_LIMIT_EXCEEDED");
      }

      const createdRequest = await tx.loanRequest.create({
        data: {
          schoolId: auth.schoolId,
          studentId: student.id,
          status: "MENUNGGU_KONFIRMASI",
          expiresAt,
          notes: notesResult.value ?? null,
          items: {
            create: bookIds.map((bookId) => ({
              schoolId: auth.schoolId,
              bookId,
              activeKey: `${auth.schoolId}:${student.id}:${bookId}`,
            })),
          },
        },
        select: {
          id: true,
          studentId: true,
          status: true,
          requestedAt: true,
          expiresAt: true,
          notes: true,
          items: { select: { id: true, bookId: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          schoolId: auth.schoolId,
          userId: auth.user.id,
          action: "CREATE",
          entityType: "LoanRequest",
          entityId: createdRequest.id,
          newData: jsonValue(createdRequest),
          ipAddress: getClientIp(request),
        },
      });
      return createdRequest;
    }, { isolationLevel: "Serializable" }));

    return NextResponse.json({ data: created }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "SETTINGS_NOT_FOUND") return errorResponse("Pengaturan perpustakaan belum tersedia.", 500);
    if (error instanceof Error && error.message === "BOOK_LIMIT_EXCEEDED") return errorResponse("Jumlah buku melebihi batas anggota.", 422);
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") return errorResponse("Siswa tidak ditemukan atau tidak aktif.", 422);
    if (error instanceof Error && error.message === "BOOK_NOT_AVAILABLE") return errorResponse("Buku tidak aktif, kategori tidak aktif, atau tidak memiliki copy tersedia.", 409);
    if (error instanceof Error && error.message === "DUPLICATE_ACTIVE_REQUEST") return errorResponse("Sudah ada pengajuan aktif untuk salah satu buku.", 409);
    if (error instanceof Error && error.message === "ACTIVE_LIMIT_EXCEEDED") return errorResponse("Total pinjaman dan pengajuan aktif melebihi batas anggota.", 422);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return errorResponse("Sudah ada pengajuan aktif untuk salah satu buku.", 409);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") return errorResponse("Permintaan konflik, coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
