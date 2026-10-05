import { NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createAuthToken,
  noStoreHeaders,
} from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const INVALID_CREDENTIALS = "Username atau password salah.";
const TOO_MANY_REQUESTS = "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.";
const SERVER_ERROR = "Terjadi kesalahan pada server.";
const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,p=4,t=3$WNXtRUBVPKJd0ntXbRHsaA$37u7VFDdU7kTjPe9/olF+O8r1vsnAnEXBBnExV2Dw4k";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi").max(100, "Username terlalu panjang"),
  password: z.string().min(1, "Password wajib diisi").max(256, "Password terlalu panjang"),
  role: z.enum(["PUSTAKAWAN", "SISWA"]).optional(),
});

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimitResult = rateLimit(`login:${ip}`, 5, 60000); // 5 attempts per 60s per IP

  if (!rateLimitResult.success) {
    return errorResponse(TOO_MANY_REQUESTS, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid.", 400);
  }

  const parseResult = loginSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || INVALID_CREDENTIALS, 400);
  }

  const { username, password, role } = parseResult.data;

  try {
    let user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      const student = await prisma.student.findUnique({
        where: { nis: username },
        select: {
          user: {
            select: {
              id: true,
              username: true,
              passwordHash: true,
              name: true,
              role: true,
              status: true,
            },
          },
        },
      });
      if (student?.user) {
        user = student.user;
      }
    }

    const passwordMatches = await argon2.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      password,
    );

    if (!user || user.status !== "AKTIF" || !passwordMatches) {
      return errorResponse(INVALID_CREDENTIALS, 401);
    }

    if (role && user.role !== role) {
      if (role === "PUSTAKAWAN") {
        return errorResponse("Akun ini bukan akun Admin/Pustakawan. Silakan masuk melalui tab Siswa.", 403);
      }
      return errorResponse("Akun ini bukan akun Siswa. Silakan masuk melalui tab Admin.", 403);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createAuthToken({
      userId: user.id,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        token, // Added token for fallback authorization Header
      },
      { headers: noStoreHeaders },
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return response;
  } catch {
    return errorResponse(SERVER_ERROR, 500);
  }
}

