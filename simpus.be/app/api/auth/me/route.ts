import { NextResponse } from "next/server";
import { noStoreHeaders, requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Tidak memiliki akses." },
      { status: auth.status, headers: noStoreHeaders }
    );
  }

  try {
    let student = null;
    if (auth.user.role === "SISWA") {
      student = await prisma.student.findFirst({
        where: { userId: auth.user.id, isActive: true },
        select: {
          id: true,
          nis: true,
          name: true,
          className: true,
          libraryCardNumber: true,
          phone: true,
        },
      });
    }

    return NextResponse.json(
      {
        user: {
          id: auth.user.id,
          username: auth.user.username,
          name: auth.user.name,
          role: auth.user.role,
        },
        role: auth.user.role,
        student,
      },
      { headers: noStoreHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
