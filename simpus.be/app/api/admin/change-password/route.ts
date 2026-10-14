import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/app/api/admin/requireSuperAdmin';
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createAuthToken,
  noStoreHeaders,
} from '@/lib/auth';
import { getClientIp, isJsonContentType, isRecord } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? '127.0.0.1';
  const rl = rateLimit(`admin_change_pwd:${ip}`, 5, 60000);
  if (!rl.success) {
    return errorResponse('Terlalu banyak permintaan ubah password. Coba lagi nanti.', 429);
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok) return errorResponse('Autentikasi Super Admin diperlukan.', auth.status);
  if (!isJsonContentType(request)) return errorResponse('Content-Type harus application/json.', 415);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body JSON tidak valid.', 400);
  }
  if (!isRecord(body)) return errorResponse('Body request tidak valid.', 422);

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (currentPassword.length > 256 || newPassword.length < 12 || newPassword.length > 256) {
    return errorResponse('Password baru minimal 12 karakter dan maksimal 256 karakter.', 422);
  }
  if (currentPassword === newPassword) {
    return errorResponse('Password baru harus berbeda dengan password lama.', 422);
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { passwordHash: true },
  });

  if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
    return errorResponse('Password saat ini salah.', 401);
  }

  const passwordHash = await argon2.hash(newPassword);
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: auth.user.id },
      data: { passwordHash, mustChangePassword: false },
      select: { id: true, schoolId: true, role: true },
    });
    await tx.auditLog.create({
      data: {
        schoolId: auth.user.schoolId,
        userId: auth.user.id,
        action: 'SUPERADMIN_CHANGE_PASSWORD',
        entityType: 'User',
        entityId: auth.user.id,
        ipAddress: getClientIp(request),
      },
    });
    return u;
  });

  const token = await createAuthToken({
    userId: updated.id,
    schoolId: updated.schoolId,
    role: updated.role,
  });

  const response = NextResponse.json(
    { message: 'Password berhasil diubah.' },
    { headers: noStoreHeaders }
  );
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
  return response;
}
