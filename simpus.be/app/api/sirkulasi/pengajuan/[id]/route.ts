import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  noStoreHeaders,
  requireAuthenticatedUser,
  requireStudent,
} from "@/lib/auth";
import { isUuid } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID pengajuan tidak valid.", 422);

  let schoolId = auth.schoolId;
  let studentId: string | undefined;

  if (auth.user.role === "SISWA") {
    const studentAuth = await requireStudent();
    if (!studentAuth.ok) return errorResponse("Tidak memiliki akses.", studentAuth.status);
    schoolId = studentAuth.schoolId;
    studentId = studentAuth.student.id;
  } else if (auth.user.role !== "PUSTAKAWAN") {
    return errorResponse("Tidak memiliki akses.", 403);
  }

  const request = await prisma.loanRequest.findFirst({
    where: {
      id,
      schoolId,
      ...(studentId ? { studentId } : {}),
    },
    select: {
      id: true,
      status: true,
      requestedAt: true,
      expiresAt: true,
      rejectionNote: true,
      loanId: true,
      student: {
        select: {
          id: true,
          nis: true,
          name: true,
          className: true,
          libraryCardNumber: true,
        },
      },
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              coverUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!request) return errorResponse("Pengajuan tidak ditemukan.", 404);

  return NextResponse.json(
    { data: request },
    { status: 200, headers: noStoreHeaders },
  );
}
