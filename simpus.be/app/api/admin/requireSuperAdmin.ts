import { getTokenFromRequest, verifyAuthToken, prisma, userSelect } from '@/lib/auth';

export async function requireSuperAdmin() {
  const token = await getTokenFromRequest();
  if (!token) return { ok: false as const, status: 401 as const };
  try {
    const payload = await verifyAuthToken(token);
    if (payload.role !== 'SUPERADMIN') return { ok: false as const, status: 403 as const };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: userSelect,
    });
    if (!user || user.status !== 'AKTIF') return { ok: false as const, status: 401 as const };
    return { ok: true as const, user };
  } catch {
    return { ok: false as const, status: 401 as const };
  }
}
