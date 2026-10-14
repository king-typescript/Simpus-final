import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/app/api/admin/requireSuperAdmin';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const schools = await prisma.school.findMany({
    select: { id: true, code: true, name: true, isActive: true, createdAt: true }
  });
  return NextResponse.json(schools);
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { code, name, librarianUsername, librarianName, password } = body;
  if (!code || !name || !librarianUsername || !librarianName) {
    return NextResponse.json({ error: 'Kode, nama sekolah, username, dan nama pustakawan wajib diisi.' }, { status: 400 });
  }

  const cleanCode = code.trim().toUpperCase();
  const tempPassword = password && password.trim().length >= 8 ? password.trim() : randomBytes(12).toString('base64url');
  const passwordHash = await argon2.hash(tempPassword);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.school.findUnique({ where: { code: cleanCode } });
      if (existing) throw new Error('KODE_SEKOLAH_SUDAH_DIGUNAKAN');
      const school = await tx.school.create({ data: { code: cleanCode, name: name.trim(), isActive: true } });
      await tx.librarySetting.create({ data: { schoolId: school.id } });
      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          username: librarianUsername.trim().toLowerCase(),
          passwordHash,
          role: 'PUSTAKAWAN',
          status: 'AKTIF',
          mustChangePassword: false,
          name: librarianName.trim(),
        },
        select: { username: true },
      });
      return { school, tempPassword, user };
    });

    return NextResponse.json({ school: result.school, librarian: result.user.username, temporaryPassword: result.tempPassword });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error && e.message === 'KODE_SEKOLAH_SUDAH_DIGUNAKAN'
      ? 'Kode Tenant / Sekolah sudah digunakan. Gunakan kode yang unik!'
      : e instanceof Error ? e.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
