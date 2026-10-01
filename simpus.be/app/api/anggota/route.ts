import { NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const PASSWORD_MIN_LENGTH = 12;

const createStudentSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi").max(100, "Username terlalu panjang"),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password minimal ${PASSWORD_MIN_LENGTH} karakter`).max(256),
  nis: z.string().trim().min(1, "NIS wajib diisi").max(50, "NIS terlalu panjang"),
  name: z.string().trim().min(1, "Nama wajib diisi").max(150, "Nama terlalu panjang"),
  className: z.string().trim().min(1, "Kelas wajib diisi").max(100, "Kelas terlalu panjang"),
  libraryCardNumber: z.string().trim().min(1, "Nomor kartu wajib diisi").max(100),
  phone: z.string().trim().max(30).nullable().optional(),
});

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return jsonError("Tidak memiliki akses.", auth.status);

  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 1);
  const limit = Math.min(
    positiveInteger(url.searchParams.get("limit"), DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const search = url.searchParams.get("search")?.trim() ?? "";
  const className = url.searchParams.get("className")?.trim() ?? "";
  const status = url.searchParams.get("status");

  if (status && status !== "AKTIF" && status !== "NONAKTIF") {
    return jsonError("Status tidak valid.", 422);
  }

  const where = {
    ...(status ? { isActive: status === "AKTIF" } : {}),
    ...(className ? { className: { contains: className, mode: "insensitive" as const } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { nis: { contains: search, mode: "insensitive" as const } },
            { libraryCardNumber: { contains: search, mode: "insensitive" as const } },
            { user: { username: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  try {
    const [data, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          nis: true,
          name: true,
          className: true,
          libraryCardNumber: true,
          phone: true,
          isActive: true,
          joinedAt: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, username: true, status: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json(
      { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
      { headers: noStoreHeaders },
    );
  } catch {
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return jsonError("Tidak memiliki akses.", auth.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Body JSON tidak valid.", 400);
  }

  const parseResult = createStudentSchema.safeParse(body);
  if (!parseResult.success) {
    return jsonError(parseResult.error.issues[0]?.message || "Data anggota tidak valid.", 422);
  }

  const { username, password, nis, name, className, libraryCardNumber, phone } = parseResult.data;

  try {
    const passwordHash = await argon2.hash(password);
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { username, passwordHash, role: "SISWA", status: "AKTIF", name },
      });
      const created = await tx.student.create({
        data: { userId: user.id, nis, name, className, libraryCardNumber, phone: phone || null },
        select: { id: true, nis: true, name: true, className: true, libraryCardNumber: true, phone: true, isActive: true, joinedAt: true, user: { select: { id: true, username: true, status: true } } },
      });
      await tx.auditLog.create({ data: { userId: auth.user.id, action: "CREATE", entityType: "Student", entityId: created.id, newData: created } });
      return created;
    });
    return NextResponse.json({ data: student }, { status: 201, headers: noStoreHeaders });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return jsonError("Username, NIS, atau nomor kartu sudah digunakan.", 409);
    }
    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
