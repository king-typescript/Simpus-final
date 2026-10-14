import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/lib/auth";
import { expireLoanRequests } from "@/lib/loan-request-expiry";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function isTransactionConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return errorResponse("Tidak memiliki akses.", 401);

  try {
    const result = await expireLoanRequests();
    return NextResponse.json({ data: result }, { status: 200, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (isTransactionConflict(error)) return errorResponse("Permintaan konflik, coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
