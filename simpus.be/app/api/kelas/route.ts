import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireAuthenticatedUser, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Nama kelas wajib diisi").max(100, "Nama kelas terlalu panjang"),
});

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function isPositiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

const classSelect = {
  id: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { students: true } } as unknown as object,
} as const;

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return errorResponse("Autentikasi diperlukan.", auth.status);

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";

  if (status && status !== "AKTIF" && status !== "NONAKTIF") {
    return errorResponse("Status kelas tidak valid.", 422);
  }

  const where = {
    isActive: status ? status === "AKTIF" : true,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  try {
    const classes = await prisma.schoolClass.findMany({
      where,
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    const withCounts = await Promise.all(
      classes.map(async (cls) => {
        const count = await prisma.student.count({ where: { className: cls.name } });
        return { ...cls, studentCount: count };
      })
    );

    return NextResponse.json({ data: withCounts }, { headers: noStoreHeaders });
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }

  const parseResult = createClassSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data kelas tidak valid.", 422);
  }

  const { name } = parseResult.data;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const cls = await tx.schoolClass.create({
        data: { name, isActive: true },
        select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
      });
      await tx.auditLog.create({
        data: { userId: auth.user.id, action: "CREATE", entityType: "SchoolClass", entityId: cls.id, newData: jsonValue(cls) },
      });
      return cls;
    });
    return NextResponse.json({ data: created }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return errorResponse("Nama kelas sudah digunakan.", 409);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
