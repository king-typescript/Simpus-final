import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const paymentSchema = z.object({
  receiptNumber: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/, "Nomor kuitansi tidak valid").optional(),
  amount: z.string().trim().regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, "Nominal tidak valid").optional(),
  note: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").nullable().optional(),
});

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function uuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

function isTransactionConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

function isOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const reqOrigin = new URL(request.url).origin;
    
    // Izinkan semua origin IP lokal untuk testing mobile (format: http://192.168.x.x:5173)
    if (process.env.NODE_ENV !== "production" || process.env.COOKIE_SECURE === "false") {
      if (origin.startsWith("http://192.168.") || origin.startsWith("http://10.") || origin.startsWith("http://172.")) {
        return true;
      }
    }

    const allowed = [
      reqOrigin,
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean);
    return allowed.includes(origin);
  } catch {
    return false;
  }
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

const fineSelect = {
  id: true,
  loanItemId: true,
  type: true,
  daysLate: true,
  ratePerDay: true,
  amount: true,
  status: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  loanItem: {
    select: {
      id: true,
      returnedAt: true,
      returnCondition: true,
      returnNote: true,
      loan: {
        select: {
          id: true,
          loanDate: true,
          dueDate: true,
          returnedAt: true,
          status: true,
          student: { select: { id: true, nis: true, name: true, className: true, libraryCardNumber: true } },
        },
      },
      copy: {
        select: {
          id: true,
          barcode: true,
          status: true,
          book: { select: { id: true, title: true } },
        },
      },
    },
  },
  payment: {
    select: {
      id: true,
      fineId: true,
      amount: true,
      paymentMethod: true,
      receiptNumber: true,
      paidAt: true,
      note: true,
      receivedBy: { select: { id: true, name: true, username: true } },
    },
  },
} as const;

function serializeFine(fine: Prisma.FineGetPayload<{ select: typeof fineSelect }>) {
  return {
    ...fine,
    ratePerDay: fine.ratePerDay.toFixed(2),
    amount: fine.amount.toFixed(2),
    payment: fine.payment ? { ...fine.payment, amount: fine.payment.amount.toFixed(2) } : null,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  const { id } = await context.params;
  if (!uuid(id)) return errorResponse("ID denda tidak valid.", 422);

  try {
    const fine = await prisma.fine.findUnique({ where: { id }, select: fineSelect });
    return fine ? NextResponse.json({ data: serializeFine(fine) }, { headers: noStoreHeaders }) : errorResponse("Denda tidak ditemukan.", 404);
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  if (!isOriginAllowed(request)) return errorResponse("Origin tidak diizinkan.", 403);

  const { id } = await context.params;
  if (!uuid(id)) return errorResponse("ID denda tidak valid.", 422);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }

  const parseResult = paymentSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data pembayaran tidak valid.", 422);
  }

  const { receiptNumber: rawReceiptNumber, amount: rawAmount, note = null } = parseResult.data;

  try {
    const result = await serializable(() => prisma.$transaction(async (tx) => {
      const fine = await tx.fine.findUnique({ where: { id }, select: fineSelect });
      if (!fine) throw new Error("FINE_NOT_FOUND");
      if (fine.status !== "BELUM_DIBAYAR") throw new Error("FINE_ALREADY_SETTLED");
      if (fine.payment) throw new Error("PAYMENT_EXISTS");
      if (!fine.loanItem.returnedAt) throw new Error("BOOK_NOT_RETURNED");

      const paymentAmount = rawAmount ? new Prisma.Decimal(rawAmount) : fine.amount;
      if (!paymentAmount.equals(fine.amount)) throw new Error("AMOUNT_MISMATCH");

      const receiptNumber = rawReceiptNumber || `KW-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const payment = await tx.finePayment.create({
        data: { fineId: id, receivedById: auth.user.id, amount: paymentAmount, paymentMethod: "CASH", receiptNumber, note: note || null },
        select: { id: true, fineId: true, amount: true, paymentMethod: true, receiptNumber: true, paidAt: true, note: true, receivedBy: { select: { id: true, name: true, username: true } } },
      });
      await tx.fine.update({ where: { id }, data: { status: "LUNAS" } });
      const updatedFine = await tx.fine.findUniqueOrThrow({ where: { id }, select: fineSelect });

      await tx.auditLog.create({
        data: { userId: auth.user.id, action: "PAYMENT", entityType: "Fine", entityId: id, oldData: jsonValue(fine), newData: jsonValue(updatedFine) },
      });

      return { fine: updatedFine, payment };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));

    return NextResponse.json({ data: { fine: serializeFine(result.fine), payment: { ...result.payment, amount: result.payment.amount.toFixed(2) } } }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "FINE_NOT_FOUND") return errorResponse("Denda tidak ditemukan.", 404);
    if (error instanceof Error && error.message === "FINE_ALREADY_SETTLED") return errorResponse("Denda sudah diselesaikan.", 409);
    if (error instanceof Error && error.message === "PAYMENT_EXISTS") return errorResponse("Pembayaran denda sudah tercatat.", 409);
    if (error instanceof Error && error.message === "AMOUNT_MISMATCH") return errorResponse("Nominal pembayaran harus sama dengan nominal denda.", 422);
    if (error instanceof Error && error.message === "BOOK_NOT_RETURNED") return errorResponse("Denda belum dapat dibayar sebelum buku dikembalikan.", 422);
    if (isTransactionConflict(error)) return errorResponse("Permintaan konflik, coba lagi.", 409);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return errorResponse("Nomor kuitansi sudah digunakan.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
