import { NextResponse } from "next/server";
import { FineStatus, LoanStatus, UserStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";
import { invalidateDashboardCache } from "@/lib/dashboardCache";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function validId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

const selectStudent = {
  id: true,
  nis: true,
  name: true,
  className: true,
  libraryCardNumber: true,
  phone: true,
  isActive: true,
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, username: true, status: true } },
} as const;

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return jsonError("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!validId(id)) return jsonError("ID anggota tidak valid.", 422);

  try {
    const data = await prisma.student.findUnique({ where: { id }, select: selectStudent });
    return data ? NextResponse.json({ data }, { headers: noStoreHeaders }) : jsonError("Anggota tidak ditemukan.", 404);
  } catch {
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return jsonError("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!validId(id)) return jsonError("ID anggota tidak valid.", 422);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Body JSON tidak valid.", 400); }
  if (typeof body !== "object" || body === null) return jsonError("Body request tidak valid.", 422);

  const input = body as Record<string, unknown>;
  const data: { nis?: string; name?: string; className?: string; libraryCardNumber?: string; phone?: string | null; isActive?: boolean } = {};
  for (const field of ["nis", "name", "className", "libraryCardNumber"] as const) {
    if (field in input) {
      if (typeof input[field] !== "string" || !input[field].trim()) return jsonError("Data anggota tidak valid.", 422);
      data[field] = input[field].trim();
    }
  }
  if ("isActive" in input) {
    if (typeof input.isActive !== "boolean") return jsonError("Status anggota tidak valid.", 422);
    data.isActive = input.isActive;
  }
  if ("phone" in input) {
    if (input.phone !== null && typeof input.phone !== "string") return jsonError("Nomor telepon tidak valid.", 422);
    data.phone = typeof input.phone === "string" ? input.phone.trim() || null : null;
  }
  if (!Object.keys(data).length) return jsonError("Tidak ada perubahan.", 422);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.student.findUnique({ where: { id }, select: { userId: true } });
      if (!current) return null;
      const student = await tx.student.update({ where: { id }, data, select: selectStudent });
      const userUpdate: { name?: string; status?: UserStatus } = {};
      if (data.name !== undefined) userUpdate.name = data.name;
      if (data.isActive !== undefined) userUpdate.status = data.isActive ? UserStatus.AKTIF : UserStatus.NONAKTIF;
      if (Object.keys(userUpdate).length) await tx.user.update({ where: { id: current.userId }, data: userUpdate });
      await tx.auditLog.create({ data: { userId: auth.user.id, action: "UPDATE", entityType: "Student", entityId: id, newData: student } });
      return student;
    });
    return updated ? NextResponse.json({ data: updated }, { headers: noStoreHeaders }) : jsonError("Anggota tidak ditemukan.", 404);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return jsonError("NIS atau nomor kartu sudah digunakan.", 409);
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return jsonError("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!validId(id)) return jsonError("ID anggota tidak valid.", 422);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id },
        select: { id: true, userId: true, name: true, nis: true },
      });
      if (!student) return "NOT_FOUND";

      // 1. Cek pinjaman aktif atau sebagian dikembalikan
      const activeLoan = await tx.loan.findFirst({
        where: {
          studentId: id,
          status: { in: [LoanStatus.AKTIF, LoanStatus.SEBAGIAN_DIKEMBALIKAN] },
        },
      });
      if (activeLoan) {
        return "HAS_ACTIVE_LOANS";
      }

      // 2. Cek tunggakan denda belum dibayar
      const unpaidFine = await tx.fine.findFirst({
        where: {
          loanItem: { loan: { studentId: id } },
          status: FineStatus.BELUM_DIBAYAR,
        },
      });
      if (unpaidFine) {
        return "HAS_UNPAID_FINES";
      }

      // 3. Bersihkan cascading relasi riwayat peminjaman siswa
      const loans = await tx.loan.findMany({
        where: { studentId: id },
        select: { id: true },
      });
      const loanIds = loans.map((l) => l.id);

      if (loanIds.length > 0) {
        const items = await tx.loanItem.findMany({
          where: { loanId: { in: loanIds } },
          select: { id: true },
        });
        const itemIds = items.map((i) => i.id);

        if (itemIds.length > 0) {
          const fines = await tx.fine.findMany({
            where: { loanItemId: { in: itemIds } },
            select: { id: true },
          });
          const fineIds = fines.map((f) => f.id);

          if (fineIds.length > 0) {
            await tx.finePayment.deleteMany({
              where: { fineId: { in: fineIds } },
            });
            await tx.fine.deleteMany({
              where: { id: { in: fineIds } },
            });
          }

          await tx.loanItem.deleteMany({
            where: { id: { in: itemIds } },
          });
        }

        await tx.loan.deleteMany({
          where: { id: { in: loanIds } },
        });
      }

      // 4. Hapus data student dan user
      await tx.student.delete({ where: { id } });
      if (student.userId) {
        await tx.user.delete({ where: { id: student.userId } });
      }

      // 5. Catat audit log
      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "DELETE",
          entityType: "Student",
          entityId: id,
          oldData: { name: student.name, nis: student.nis },
        },
      });

      return "SUCCESS";
    });

    if (result === "NOT_FOUND") return jsonError("Anggota tidak ditemukan.", 404);
    if (result === "HAS_ACTIVE_LOANS") {
      return jsonError("Tidak dapat menghapus anggota yang masih memiliki pinjaman buku aktif.", 400);
    }
    if (result === "HAS_UNPAID_FINES") {
      return jsonError("Tidak dapat menghapus anggota yang masih memiliki tanggungan denda.", 400);
    }

    invalidateDashboardCache();
    return new NextResponse(null, { status: 204 });
  } catch {
    return jsonError("Terjadi kesalahan pada server saat menghapus data anggota.", 500);
  }
}
