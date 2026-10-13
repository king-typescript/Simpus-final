import { NextResponse } from "next/server";
import { LoanRequestStatus, LoanStatus } from "@/app/generated/prisma/client";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";
import { getClientIp, isJsonContentType, isUuid } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

function prismaCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : null;
}

async function serializable<T>(operation: () => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (prismaCode(error) !== "P2034" || attempt === 2) throw error;
    }
  }
  throw new Error("TRANSACTION_CONFLICT");
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  if (!isJsonContentType(request)) return errorResponse("Content-Type harus application/json.", 415);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }
  if (body !== null && typeof body === "object" && !Array.isArray(body) && Object.keys(body).length > 0) {
    return errorResponse("Endpoint persetujuan tidak menerima body.", 422);
  }
  if (body !== null && body !== undefined && typeof body !== "object") {
    return errorResponse("Body request tidak valid.", 422);
  }

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID pengajuan tidak valid.", 422);

  try {
    const result = await serializable(() => prisma.$transaction(async (tx) => {
      const now = new Date();
      const requestData = await tx.loanRequest.findFirst({
        where: { id, schoolId: auth.schoolId },
        select: {
          id: true,
          studentId: true,
          status: true,
          expiresAt: true,
          notes: true,
          items: { select: { id: true, bookId: true }, orderBy: { id: "asc" } },
        },
      });
      if (!requestData) throw new Error("REQUEST_NOT_FOUND");
      if (requestData.status !== LoanRequestStatus.MENUNGGU_KONFIRMASI) throw new Error("REQUEST_NOT_PENDING");
      if (requestData.expiresAt <= now) throw new Error("REQUEST_EXPIRED");

      const settings = await tx.librarySetting.findUnique({
        where: { schoolId: auth.schoolId },
        select: { maxLoanDays: true, maxActiveCopies: true },
      });
      if (!settings) throw new Error("SETTINGS_NOT_FOUND");

      const student = await tx.student.findFirst({
        where: { id: requestData.studentId, schoolId: auth.schoolId, isActive: true, user: { status: "AKTIF" } },
        select: { id: true },
      });
      if (!student) throw new Error("STUDENT_NOT_ACTIVE");

      const activeLoanItems = await tx.loanItem.count({
        where: {
          schoolId: auth.schoolId,
          returnedAt: null,
          loan: { studentId: student.id, schoolId: auth.schoolId, status: { in: ["AKTIF", "SEBAGIAN_DIKEMBALIKAN"] } },
        },
      });
      const activeRequestItems = await tx.loanRequestItem.count({
        where: {
          schoolId: auth.schoolId,
          requestId: { not: requestData.id },
          activeKey: { not: null },
          request: {
            studentId: student.id,
            schoolId: auth.schoolId,
            status: { in: [LoanRequestStatus.MENUNGGU_KONFIRMASI, LoanRequestStatus.DISETUJUI] },
            expiresAt: { gt: now },
          },
        },
      });
      if (activeLoanItems + activeRequestItems + requestData.items.length > settings.maxActiveCopies) throw new Error("ACTIVE_LIMIT_EXCEEDED");

      const books = await tx.book.findMany({
        where: {
          schoolId: auth.schoolId,
          id: { in: requestData.items.map((item) => item.bookId) },
          isActive: true,
          category: { is: { isActive: true } },
        },
        select: { id: true },
      });
      if (books.length !== requestData.items.length) throw new Error("BOOK_NOT_ACTIVE");

      const copyIds: string[] = [];
      for (const item of requestData.items) {
        const copy = await tx.bookCopy.findFirst({
          where: { schoolId: auth.schoolId, bookId: item.bookId, isActive: true, status: "TERSEDIA" },
          orderBy: { id: "asc" },
          select: { id: true },
        });
        if (!copy) throw new Error("COPY_NOT_AVAILABLE");
        const locked = await tx.bookCopy.updateMany({
          where: { id: copy.id, schoolId: auth.schoolId, isActive: true, status: "TERSEDIA" },
          data: { status: "DIPINJAM" },
        });
        if (locked.count !== 1) throw new Error("COPY_CONFLICT");
        copyIds.push(copy.id);
      }

      const dueDate = new Date(now.getTime() + settings.maxLoanDays * 86_400_000);
      const loan = await tx.loan.create({
        data: {
          schoolId: auth.schoolId,
          studentId: student.id,
          processedById: auth.user.id,
          loanDate: now,
          dueDate,
          notes: requestData.notes,
          status: LoanStatus.AKTIF,
          items: { create: copyIds.map((copyId) => ({ schoolId: auth.schoolId, copyId })) },
        },
        select: { id: true, loanDate: true, dueDate: true, status: true, items: { select: { copyId: true } } },
      });

      const updated = await tx.loanRequest.updateMany({
        where: { id, schoolId: auth.schoolId, status: LoanRequestStatus.MENUNGGU_KONFIRMASI },
        data: { status: LoanRequestStatus.DISETUJUI, processedById: auth.user.id, confirmedAt: now, dueDate, loanId: loan.id },
      });
      if (updated.count !== 1) throw new Error("REQUEST_STATE_CONFLICT");

      await tx.loanRequestItem.updateMany({ where: { requestId: id, schoolId: auth.schoolId }, data: { activeKey: null } });

      const response = { requestId: id, status: LoanRequestStatus.DISETUJUI, loanId: loan.id, loanDate: loan.loanDate, dueDate: loan.dueDate, items: loan.items };
      await tx.auditLog.create({
        data: {
          schoolId: auth.schoolId,
          userId: auth.user.id,
          action: "APPROVE",
          entityType: "LoanRequest",
          entityId: id,
          oldData: jsonValue({ status: requestData.status, expiresAt: requestData.expiresAt, items: requestData.items }),
          newData: jsonValue(response),
          ipAddress: getClientIp(request),
        },
      });
      return response;
    }, { isolationLevel: "Serializable" }));

    return NextResponse.json({ data: result }, { status: 200, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "REQUEST_NOT_FOUND") return errorResponse("Pengajuan tidak ditemukan.", 404);
    if (error instanceof Error && error.message === "REQUEST_NOT_PENDING") return errorResponse("Pengajuan tidak berada pada status menunggu konfirmasi.", 409);
    if (error instanceof Error && error.message === "REQUEST_EXPIRED") return errorResponse("Pengajuan sudah kedaluwarsa.", 409);
    if (error instanceof Error && error.message === "SETTINGS_NOT_FOUND") return errorResponse("Pengaturan perpustakaan belum tersedia.", 500);
    if (error instanceof Error && error.message === "STUDENT_NOT_ACTIVE") return errorResponse("Siswa tidak aktif.", 409);
    if (error instanceof Error && error.message === "ACTIVE_LIMIT_EXCEEDED") return errorResponse("Batas pinjaman aktif siswa sudah tercapai.", 409);
    if (error instanceof Error && error.message === "BOOK_NOT_ACTIVE") return errorResponse("Salah satu buku atau kategorinya tidak aktif.", 409);
    if (error instanceof Error && error.message === "COPY_NOT_AVAILABLE") return errorResponse("Copy tersedia tidak ditemukan untuk salah satu buku.", 409);
    if (error instanceof Error && (error.message === "COPY_CONFLICT" || error.message === "REQUEST_STATE_CONFLICT")) return errorResponse("Data berubah bersamaan. Silakan coba lagi.", 409);
    if (prismaCode(error) === "P2034") return errorResponse("Data berubah bersamaan. Silakan coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
