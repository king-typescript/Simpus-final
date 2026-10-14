import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';
import { createAuthToken, AUTH_COOKIE_NAME, authCookieOptions, noStoreHeaders } from '@/lib/auth';
import { getClientIp, isJsonContentType, isRecord } from '@/lib/validation';
import { isRateLimited, recordAccountFailure } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const INVALID_CREDENTIALS = 'Username atau password salah.';
const TOO_MANY_ATTEMPTS = 'Terlalu banyak percobaan login. Coba lagi nanti.';
const SERVER_ERROR = 'Terjadi kesalahan pada server.';
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$WNXtRUBVPKJd0ntXbRHsaA$37u7VFDdU7kTjPe9/olF+O8r1vsnAnEXBBnExV2Dw4k';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

export async function POST(req: Request) {
  if (!isJsonContentType(req)) {
    return errorResponse('Content-Type harus application/json.', 415);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Body JSON tidak valid.', 400);
  }

  if (!isRecord(body)) {
    return errorResponse('Body request tidak valid.', 400);
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password || username.length > 100 || password.length > 256) {
    return errorResponse(INVALID_CREDENTIALS, 401);
  }

  const rawIp = getClientIp(req);
  const ip = rawIp ?? "127.0.0.1";
  const rateLimitIdentity = `SUPERADMIN:${username.toLowerCase()}`;

  if (await isRateLimited([rateLimitIdentity, ip], true)) {
    return NextResponse.json({ error: TOO_MANY_ATTEMPTS }, { status: 429, headers: { ...noStoreHeaders, "Retry-After": "900" } });
  }

  try {
    const adminUser = await prisma.user.findFirst({
      where: {
        username,
        role: 'SUPERADMIN',
      },
      select: {
        id: true,
        schoolId: true,
        username: true,
        name: true,
        passwordHash: true,
        role: true,
        status: true,
        mustChangePassword: true,
      },
    });

    const matches = await argon2.verify(
      adminUser?.passwordHash ?? DUMMY_PASSWORD_HASH,
      password
    );

    if (!adminUser || adminUser.status !== 'AKTIF' || !matches) {
      await prisma.auditLog
        .create({
          data: {
            schoolId: adminUser?.schoolId ?? null,
            userId: adminUser?.id ?? null,
            action: 'SUPERADMIN_LOGIN_FAILED',
            entityType: 'User',
            entityId: adminUser?.id ?? null,
            newData: { username },
            ipAddress: ip,
          },
        })
        .catch(() => {});
      await recordAccountFailure(rateLimitIdentity, ip, true);
      return errorResponse(INVALID_CREDENTIALS, 401);
    }


    await prisma.$transaction([
      prisma.user.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          schoolId: adminUser.schoolId,
          userId: adminUser.id,
          action: 'SUPERADMIN_LOGIN_SUCCESS',
          entityType: 'User',
          entityId: adminUser.id,
          ipAddress: ip,
        },
      }),
    ]);

    const token = await createAuthToken({
      userId: adminUser.id,
      schoolId: adminUser.schoolId,
      role: adminUser.role,
    });

    const response = NextResponse.json(
      {
        user: {
          id: adminUser.id,
          username: adminUser.username,
          name: adminUser.name,
          role: adminUser.role,
        },
        token,
      },
      { headers: noStoreHeaders }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return response;
  } catch {
    return errorResponse(SERVER_ERROR, 500);
  }
}
