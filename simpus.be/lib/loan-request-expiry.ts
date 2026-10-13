import { Prisma, LoanRequestStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_BATCH_SIZE = 500;

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

function isTransactionConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

async function serializable<T>(operation: () => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (!isTransactionConflict(error) || attempt === 2) throw error;
    }
  }
  throw new Error("TRANSACTION_CONFLICT");
}

export type LoanRequestExpiryResult = {
  processed: number;
  expired: number;
  skipped: number;
  hasMore: boolean;
};

export async function expireLoanRequests(now = new Date()): Promise<LoanRequestExpiryResult> {
  const candidates = await prisma.loanRequest.findMany({
    where: {
      status: LoanRequestStatus.MENUNGGU_KONFIRMASI,
      expiresAt: { lte: now },
    },
    orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
    take: MAX_BATCH_SIZE,
    select: { id: true, schoolId: true },
  });

  let expired = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const result = await serializable(() => prisma.$transaction(async (tx) => {
      const updated = await tx.loanRequest.updateMany({
        where: {
          id: candidate.id,
          schoolId: candidate.schoolId,
          status: LoanRequestStatus.MENUNGGU_KONFIRMASI,
          expiresAt: { lte: now },
        },
        data: { status: LoanRequestStatus.KEDALUWARSA },
      });

      if (updated.count !== 1) return "SKIPPED" as const;

      await tx.loanRequestItem.updateMany({
        where: {
          requestId: candidate.id,
          schoolId: candidate.schoolId,
          activeKey: { not: null },
        },
        data: { activeKey: null },
      });

      await tx.auditLog.create({
        data: {
          schoolId: candidate.schoolId,
          action: "EXPIRE",
          entityType: "LoanRequest",
          entityId: candidate.id,
          oldData: jsonValue({ status: LoanRequestStatus.MENUNGGU_KONFIRMASI }),
          newData: jsonValue({ status: LoanRequestStatus.KEDALUWARSA, expiredAt: now }),
        },
      });

      return "EXPIRED" as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));

    if (result === "EXPIRED") expired += 1;
    else skipped += 1;
  }

  return {
    processed: candidates.length,
    expired,
    skipped,
    hasMore: candidates.length === MAX_BATCH_SIZE,
  };
}
