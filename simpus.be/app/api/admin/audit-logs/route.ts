import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/app/api/admin/requireSuperAdmin';
import { noStoreHeaders } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Tidak memiliki akses.' }, { status: 403, headers: noStoreHeaders });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 30, 1), 100);

  try {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        newData: true,
        ipAddress: true,
        createdAt: true,
        school: {
          select: {
            code: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(logs, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil audit log.' }, { status: 500, headers: noStoreHeaders });
  }
}
