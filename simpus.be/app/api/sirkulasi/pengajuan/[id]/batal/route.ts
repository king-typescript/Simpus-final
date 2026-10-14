import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireStudent } from "@/lib/auth";
import { getClientIp, isUuid } from "@/lib/validation";

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
  const auth = await requireStudent();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID pengajuan tidak valid.", 422);

  try {
    const cancelled = await serializable(() => prisma.$transaction(async (tx) => {
      const existing = await tx.loanRequest.findFirst({
        where: { id, schoolId: auth.schoolId, studentId: auth.student.id },
        select: {
          id: true,
          status: true,
          requestedAt: true,
          expiresAt: true,
          notes: true,
          rejectionNote: true,
          loanId: true,
          items: { select: { id: true, bookId: true, activeKey: true } },
        },
      });

      if (!existing) throw new Error("REQUEST_NOT_FOUND");
      if (existing.status !== "MENUNGGU_KONFIRMASI") throw new Error("REQUEST_NOT_CANCELLABLE");

      const updated = await tx.loanRequest.updateMany({
        where: { id, schoolId: auth.schoolId, studentId: auth.student.id, status: "MENUNGGU_KONFIRMASI" },
        data: { status: "DIBATALKAN" },
      });
      if (updated.count !== 1) throw new Error("REQUEST_STATE_CONFLICT");

      await tx.loanRequestItem.updateMany({
        where: { requestId: id, schoolId: auth.schoolId, activeKey: { not: null } },
        data: { activeKey: null },
      });

      const result = {
        id: existing.id,
        status: "DIBATALKAN" as const,
        requestedAt: existing.requestedAt,
        expiresAt: existing.expiresAt,
        notes: existing.notes,
        rejectionNote: existing.rejectionNote,
        loanId: existing.loanId,
        items: existing.items.map(({ id: itemId, bookId }) => ({ id: itemId, bookId })),
      };

      await tx.auditLog.create({
        data: {
          schoolId: auth.schoolId,
          userId: auth.user.id,
          action: "CANCEL",
          entityType: "LoanRequest",
          entityId: existing.id,
          oldData: jsonValue(existing),
          newData: jsonValue(result),
          ipAddress: getClientIp(request),
        },
      });

      return result;
    }, { isolationLevel: "Serializable" }));

    return NextResponse.json({ data: cancelled }, { status: 200, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "REQUEST_NOT_FOUND") return errorResponse("Pengajuan tidak ditemukan.", 404);
    if (error instanceof Error && error.message === "REQUEST_NOT_CANCELLABLE") return errorResponse("Pengajuan tidak dapat dibatalkan pada status saat ini.", 409);
    if (error instanceof Error && error.message === "REQUEST_STATE_CONFLICT") return errorResponse("Status pengajuan berubah. Muat ulang data lalu coba lagi.", 409);
    if (prismaCode(error) === "P2034") return errorResponse("Permintaan konflik, coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
