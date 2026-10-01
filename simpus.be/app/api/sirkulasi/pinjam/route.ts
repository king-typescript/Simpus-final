import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";
const SETTING_KEY = "DEFAULT";

const createLoanSchema = z.object({
  studentId: z.string().uuid("ID siswa tidak valid"),
  copyIds: z.array(z.string().uuid("ID eksemplar tidak valid")).optional(),
  bookId: z.string().uuid("ID buku tidak valid").optional(),
  dueDate: z.string().optional(),
  notes: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").nullable().optional(),
});

function errorResponse(error: string, status: number) { return NextResponse.json({ error }, { status, headers: noStoreHeaders }); }
function jsonValue(value: unknown) { return JSON.parse(JSON.stringify(value)); }
async function serializable<T>(operation: () => Promise<T>) { for (let attempt = 0; attempt < 3; attempt += 1) { try { return await operation(); } catch (error: unknown) { const conflict = typeof error === "object" && error !== null && "code" in error && error.code === "P2034"; if (!conflict || attempt === 2) throw error; } } throw new Error("TRANSACTION_CONFLICT"); }

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }

  const parseResult = createLoanSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data peminjaman tidak valid.", 422);
  }

  const { studentId, copyIds, bookId, dueDate: dueDateStr, notes = null } = parseResult.data;

  try {
    const loan = await serializable(() => prisma.$transaction(async (tx) => {
      const settings = await tx.librarySetting.findUnique({ where: { key: SETTING_KEY }, select: { maxLoanDays: true, maxActiveCopies: true } });
      if (!settings) throw new Error("SETTINGS_NOT_FOUND");

      let dueDate = dueDateStr ? new Date(dueDateStr) : new Date(Date.now() + (settings.maxLoanDays || 7) * 86_400_000);
      if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
        dueDate = new Date(Date.now() + (settings.maxLoanDays || 7) * 86_400_000);
      }

      let resolvedCopyIds = copyIds || [];
      if (resolvedCopyIds.length === 0) {
        if (!bookId) throw new Error("COPY_NOT_AVAILABLE");
        const availableCopy = await tx.bookCopy.findFirst({
          where: { bookId, status: "TERSEDIA", isActive: true },
          select: { id: true },
        });
        if (!availableCopy) throw new Error("COPY_NOT_AVAILABLE");
        resolvedCopyIds = [availableCopy.id];
      }

      if (resolvedCopyIds.length > settings.maxActiveCopies) throw new Error("COPY_LIMIT_EXCEEDED");
      if (!(await tx.student.findFirst({ where: { id: studentId, isActive: true, user: { status: "AKTIF" } }, select: { id: true } }))) throw new Error("STUDENT_NOT_FOUND");
      const activeCount = await tx.loanItem.count({ where: { returnedAt: null, loan: { studentId, status: { in: ["AKTIF", "SEBAGIAN_DIKEMBALIKAN"] } } } });
      if (activeCount + resolvedCopyIds.length > settings.maxActiveCopies) throw new Error("COPY_LIMIT_EXCEEDED");
      const copies = await tx.bookCopy.findMany({ where: { id: { in: resolvedCopyIds }, isActive: true, status: "TERSEDIA", book: { isActive: true, category: { is: { isActive: true } } } }, select: { id: true } });
      if (copies.length !== resolvedCopyIds.length) throw new Error("COPY_NOT_AVAILABLE");
      const locked = await tx.bookCopy.updateMany({ where: { id: { in: resolvedCopyIds }, isActive: true, status: "TERSEDIA" }, data: { status: "DIPINJAM" } });
      if (locked.count !== resolvedCopyIds.length) throw new Error("COPY_CONFLICT");
      const created = await tx.loan.create({ data: { studentId, processedById: auth.user.id, dueDate, notes: notes || null, status: "AKTIF", items: { create: resolvedCopyIds.map((copyId) => ({ copyId })) } }, select: { id: true, studentId: true, processedById: true, loanDate: true, dueDate: true, returnedAt: true, status: true, notes: true, items: { select: { id: true, copyId: true } } } });
      await tx.auditLog.create({ data: { userId: auth.user.id, action: "CREATE", entityType: "Loan", entityId: created.id, newData: jsonValue(created) } });
      return created;
    }, { isolationLevel: "Serializable" }));
    return NextResponse.json({ data: loan }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "SETTINGS_NOT_FOUND") return errorResponse("Pengaturan perpustakaan belum tersedia.", 500);
    if (error instanceof Error && error.message === "DUE_DATE_TOO_FAR") return errorResponse("Tanggal jatuh tempo melebihi batas pengaturan.", 422);
    if (error instanceof Error && error.message === "COPY_LIMIT_EXCEEDED") return errorResponse("Jumlah buku melebihi batas anggota.", 422);
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") return errorResponse("Anggota tidak ditemukan atau tidak aktif.", 422);
    if (error instanceof Error && error.message === "COPY_NOT_AVAILABLE") return errorResponse("Salah satu salinan tidak tersedia.", 409);
    if (error instanceof Error && error.message === "COPY_CONFLICT") return errorResponse("Salinan baru saja dipinjam pengguna lain.", 409);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") return errorResponse("Permintaan konflik, coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
