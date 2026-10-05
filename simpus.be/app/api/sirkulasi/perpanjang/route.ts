import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";
const SETTING_KEY = "DEFAULT";

const extendLoanSchema = z.object({
  loanId: z.string().uuid("ID peminjaman tidak valid"),
  additionalDays: z.number().int().min(1).max(30).optional(),
});

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }

  const parseResult = extendLoanSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data tidak valid.", 422);
  }

  const { loanId, additionalDays } = parseResult.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        select: { id: true, dueDate: true, status: true, notes: true },
      });

      if (!loan) throw new Error("LOAN_NOT_FOUND");
      if (loan.status === "SELESAI" || loan.status === "DIBATALKAN") {
        throw new Error("LOAN_CLOSED");
      }

      const settings = await tx.librarySetting.findUnique({
        where: { key: SETTING_KEY },
        select: { maxLoanDays: true },
      });

      const daysToAdd = additionalDays || settings?.maxLoanDays || 7;
      const currentDueDate = new Date(loan.dueDate);
      const newDueDate = new Date(currentDueDate.getTime() + daysToAdd * 86_400_000);

      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          dueDate: newDueDate,
          notes: loan.notes ? `${loan.notes} (Diperpanjang ${daysToAdd} hari)` : `Diperpanjang ${daysToAdd} hari`,
        },
        select: { id: true, dueDate: true, status: true, notes: true },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "UPDATE",
          entityType: "Loan",
          entityId: loanId,
          oldData: { dueDate: loan.dueDate },
          newData: { dueDate: newDueDate },
        },
      });

      return updatedLoan;
    });

    return NextResponse.json({ data: updated }, { headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "LOAN_NOT_FOUND") {
      return errorResponse("Peminjaman tidak ditemukan.", 404);
    }
    if (error instanceof Error && error.message === "LOAN_CLOSED") {
      return errorResponse("Peminjaman sudah selesai atau dibatalkan.", 409);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
