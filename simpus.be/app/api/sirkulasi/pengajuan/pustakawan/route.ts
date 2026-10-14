import { NextResponse } from "next/server";
import { LoanRequestStatus } from "@/app/generated/prisma/client";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUuid, parsePagination, parseSearch } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_STATUSES = new Set<string>(Object.values(LoanRequestStatus));

type Status = LoanRequestStatus;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  const searchParams = new URL(request.url).searchParams;
  const pagination = parsePagination(searchParams, { defaultLimit: 20, maxLimit: 100, maxPage: 10_000 });
  if (!pagination.ok) return errorResponse(pagination.error, 422);

  const search = parseSearch(searchParams, 100);
  if (!search.ok) return errorResponse(search.error, 422);

  const statusValue = searchParams.get("status")?.trim() ?? "";
  if (statusValue && !REQUEST_STATUSES.has(statusValue)) {
    return errorResponse("Parameter status tidak valid.", 422);
  }

  const studentId = searchParams.get("studentId")?.trim() ?? "";
  if (studentId && !isUuid(studentId)) {
    return errorResponse("Parameter studentId tidak valid.", 422);
  }

  const where = {
    schoolId: auth.schoolId,
    ...(statusValue ? { status: statusValue as Status } : {}),
    ...(studentId ? { studentId } : {}),
    ...(search.value ? {
      OR: [
        { student: { name: { contains: search.value, mode: "insensitive" as const } } },
        { student: { nis: { contains: search.value, mode: "insensitive" as const } } },
        { student: { libraryCardNumber: { contains: search.value, mode: "insensitive" as const } } },
        { items: { some: { book: { title: { contains: search.value, mode: "insensitive" as const } } } } },
      ],
    } : {}),
  };

  const { page, limit } = pagination.value;
  const skip = (page - 1) * limit;

  try {
    const [total, requests] = await Promise.all([
      prisma.loanRequest.count({ where }),
      prisma.loanRequest.findMany({
        where,
        orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          requestedAt: true,
          expiresAt: true,
          confirmedAt: true,
          dueDate: true,
          notes: true,
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
                  category: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200, headers: noStoreHeaders });
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
