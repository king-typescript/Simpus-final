import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStoreHeaders, requireAuthenticatedUser, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

const updateClassSchema = z.object({
  name: z.string().trim().min(1, "Nama kelas wajib diisi").max(100).optional(),
  isActive: z.boolean().optional(),
});

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders });
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return errorResponse("Autentikasi diperlukan.", auth.status);
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID kelas tidak valid.", 422);

  try {
    const cls = await prisma.schoolClass.findFirst({
      where: { id, schoolId: auth.schoolId, isActive: true },
      select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
    });
    return cls ? NextResponse.json({ data: cls }, { headers: noStoreHeaders }) : errorResponse("Kelas tidak ditemukan.", 404);
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID kelas tidak valid.", 422);

  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Body JSON tidak valid.", 400); }

  const parseResult = updateClassSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.issues[0]?.message || "Data kelas tidak valid.", 422);
  }

  const data = parseResult.data;
  if (!Object.keys(data).length) return errorResponse("Tidak ada perubahan.", 422);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.schoolClass.findFirst({ where: { id, schoolId: auth.schoolId, isActive: true } });
      if (!current) return null;

      if (data.name && data.name !== current.name) {
        await tx.student.updateMany({
          where: { schoolId: auth.schoolId, className: current.name },
          data: { className: data.name },
        });
      }

      const cls = await tx.schoolClass.update({
        where: { id },
        data,
        select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
      });
      await tx.auditLog.create({
        data: { schoolId: auth.schoolId, userId: auth.user.id, action: "UPDATE", entityType: "SchoolClass", entityId: id, oldData: jsonValue(current), newData: jsonValue(cls) },
      });
      return cls;
    });

    return updated ? NextResponse.json({ data: updated }, { headers: noStoreHeaders }) : errorResponse("Kelas tidak ditemukan.", 404);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return errorResponse("Nama kelas sudah digunakan.", 409);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("ID kelas tidak valid.", 422);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cls = await tx.schoolClass.findFirst({ where: { id, schoolId: auth.schoolId, isActive: true } });
      if (!cls) return "NOT_FOUND";

      const studentCount = await tx.student.count({ where: { schoolId: auth.schoolId, className: cls.name } });
      if (studentCount > 0) throw new Error("CLASS_HAS_STUDENTS");

      await tx.schoolClass.update({ where: { id }, data: { isActive: false } });
      await tx.auditLog.create({
        data: { schoolId: auth.schoolId, userId: auth.user.id, action: "DEACTIVATE", entityType: "SchoolClass", entityId: id, oldData: jsonValue(cls) },
      });
      return "DEACTIVATED";
    }, { isolationLevel: "Serializable" });

    return result === "DEACTIVATED"
      ? new NextResponse(null, { status: 204 })
      : errorResponse("Kelas tidak ditemukan.", 404);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CLASS_HAS_STUDENTS") {
      return errorResponse("Kelas masih digunakan oleh siswa dan tidak dapat dihapus.", 409);
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      return errorResponse("Permintaan konflik, coba lagi.", 409);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
