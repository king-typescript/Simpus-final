import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";
const SETTING_KEY = "DEFAULT";

const updateSettingSchema = z.object({
  maxLoanDays: z.number().int().min(1, "Durasi peminjaman minimal 1 hari").max(365, "Durasi maksimal 365 hari").optional(),
  maxActiveCopies: z.number().int().min(1, "Maksimal peminjaman minimal 1 buku").max(100, "Maksimal peminjaman 100 buku").optional(),
  fineRatePerDay: z.string().trim().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "Format denda per hari tidak valid").optional(),
}).refine(
  (data) => data.maxLoanDays !== undefined || data.maxActiveCopies !== undefined || data.fineRatePerDay !== undefined,
  "Minimal satu pengaturan harus diubah."
);

function errorResponse(error: string, status: number) { return NextResponse.json({ error }, { status, headers: noStoreHeaders }); }
function jsonValue(value: unknown) { return JSON.parse(JSON.stringify(value)); }
function isTransactionConflict(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === "P2034"; }
async function serializable<T>(operation: () => Promise<T>) { for (let attempt = 0; attempt < 3; attempt += 1) { try { return await operation(); } catch (error: unknown) { if (!isTransactionConflict(error) || attempt === 2) throw error; } } throw new Error("TRANSACTION_CONFLICT"); }

const select = { id: true, key: true, maxLoanDays: true, maxActiveCopies: true, fineRatePerDay: true, createdAt: true, updatedAt: true } as const;
function serialize(value: { id: string; key: string; maxLoanDays: number; maxActiveCopies: number; fineRatePerDay: Prisma.Decimal; createdAt: Date; updatedAt: Date }) {
  return { ...value, fineRatePerDay: value.fineRatePerDay.toFixed(2) };
}

export async function GET() {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  try {
    const settings = await prisma.librarySetting.findUnique({ where: { key: SETTING_KEY }, select });
    return settings ? NextResponse.json({ data: serialize(settings) }, { headers: noStoreHeaders }) : errorResponse("Pengaturan perpustakaan belum tersedia.", 500);
  } catch { return errorResponse("Terjadi kesalahan pada server.", 500); }
}

export async function PATCH(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }

  const parseResult = updateSettingSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Pengaturan tidak valid.", 422);
  }

  const { maxLoanDays, maxActiveCopies, fineRatePerDay } = parseResult.data;

  try {
    const settings = await serializable(() => prisma.$transaction(async (tx) => {
      const current = await tx.librarySetting.findUnique({ where: { key: SETTING_KEY }, select });
      if (!current) throw new Error("SETTINGS_NOT_FOUND");
      const updated = await tx.librarySetting.update({ where: { key: SETTING_KEY }, data: { ...(maxLoanDays !== undefined ? { maxLoanDays } : {}), ...(maxActiveCopies !== undefined ? { maxActiveCopies } : {}), ...(fineRatePerDay !== undefined ? { fineRatePerDay: new Prisma.Decimal(fineRatePerDay) } : {}) }, select });
      await tx.auditLog.create({ data: { userId: auth.user.id, action: "UPDATE", entityType: "LibrarySetting", entityId: updated.id, oldData: jsonValue(current), newData: jsonValue(updated) } });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
    return NextResponse.json({ data: serialize(settings) }, { headers: noStoreHeaders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "SETTINGS_NOT_FOUND") return errorResponse("Pengaturan perpustakaan belum tersedia.", 500);
    if (isTransactionConflict(error)) return errorResponse("Permintaan konflik, coba lagi.", 409);
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
