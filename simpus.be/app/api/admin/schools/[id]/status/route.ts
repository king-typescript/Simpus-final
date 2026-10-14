import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/app/api/admin/requireSuperAdmin';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await context.params;
  const body = await req.json();
  const { isActive } = body;
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const school = await prisma.school.update({
    where: { id },
    data: { isActive },
    select: { id: true, code: true, isActive: true }
  });
  return NextResponse.json(school);
}
