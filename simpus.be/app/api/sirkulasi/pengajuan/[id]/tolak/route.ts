import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";
import {
  getClientIp,
  hasOnlyFields,
  isJsonContentType,
  isRecord,
  isUuid,
  parseRequiredString,
} from "@/lib/validation";

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

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID pengajuan tidak valid.", 422);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }
  if (!isRecord(body) || !hasOnlyFields(body, ["rejectionNote"], true)) {
    return errorResponse("Body request tidak valid.", 422);
  }

  const rejectionResult = parseRequiredString(body.rejectionNote, {
    field: "Alasan penolakan",
    minLength: 1,
    maxLength: 1000,
  });
  if (!rejectionResult.ok) return errorResponse(rejectionResult.error, 422);

  try {
    const rejected = await serializable(() => prisma.$transaction(async (tx) => {
      const now = new Date();
      const existing = await tx.loanRequest.findFirst({
        where: { id, schoolId: auth.schoolId },
        select: {
          id: true,
          studentId: true,
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
      if (existing.status !== "MENUNGGU_KONFIRMASI") throw new Error("REQUEST_NOT_REJECTABLE");
      if (existing.expiresAt <= now) throw new Error("REQUEST_EXPIRED");

      const updated = await tx.loanRequest.updateMany({
        where: {
          id,
          schoolId: auth.schoolId,
          status: "MENUNGGU_KONFIRMASI",
          expiresAt: { gt: now },
        },
        data: {
          status: "DITOLAK",
          processedById: auth.user.id,
          rejectionNote: rejectionResult.value,
          confirmedAt: now,
        },
      });
      if (updated.count !== 1) throw new Error("REQUEST_STATE_CONFLICT");

      await tx.loanRequestItem.updateMany({
        where: { requestId: id, schoolId: auth.schoolId, activeKey: { not: null } },
        data: { activeKey: null },
      });

      const result = {
        id: existing.id,
        studentId: existing.studentId,
        status: "DITOLAK" as const,
        requestedAt: existing.requestedAt,
        expiresAt: existing.expiresAt,
        rejectionNote: rejectionResult.value,
        loanId: existing.loanId,
        items: existing.items.map(({ id: itemId, bookId }) => ({ id: itemId, bookId })),
      };
      await tx.auditLog.create({
        data: {
          schoolId: auth.schoolId,
          userId: auth.user.id,
          action: "REJECT",
          entityType: "LoanRequest",
          entityId: existing.id,
          oldData: jsonValue(existing),
          newData: jsonValue(result),
          ipAddress: getClientIp(request),
        },
      });
      return result;
    }, { isolationLevel: "Serializable" }));

    return NextResponse.json({ data: rejected }, { status: 200, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "REQUEST_NOT_FOUND") return errorResponse("Pengajuan tidak ditemukan.", 404);
    if (error instanceof Error && error.message === "REQUEST_NOT_REJECTABLE") return errorResponse("Pengajuan tidak dapat ditolak pada status saat ini.", 409);
    if (error instanceof Error && error.message === "REQUEST_EXPIRED") return errorResponse("Pengajuan sudah kedaluwarsa.", 409);
    if (error instanceof Error && error.message === "REQUEST_STATE_CONFLICT") return errorResponse("Status pengajuan berubah. Muat ulang data lalu coba lagi.", 409);
    if (prismaCode(error) === "P2034") return errorResponse("Data berubah bersamaan. Silakan coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
