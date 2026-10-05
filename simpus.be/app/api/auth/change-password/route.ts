import { NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireAuthenticatedUser } from "@/lib/auth";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(256),
});

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }

  const parseResult = changePasswordSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data tidak valid.", 422);
  }

  const { oldPassword, newPassword } = parseResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) return errorResponse("Pengguna tidak ditemukan.", 404);

    const isMatch = await argon2.verify(user.passwordHash, oldPassword);
    if (!isMatch) {
      return errorResponse("Password lama tidak sesuai.", 400);
    }

    const newPasswordHash = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "UPDATE",
        entityType: "User",
        entityId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Password berhasil diperbarui." },
      { headers: noStoreHeaders }
    );
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
