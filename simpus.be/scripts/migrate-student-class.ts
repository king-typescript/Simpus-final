/**
 * Backfill SchoolClass dari Student.className (legacy) lalu isi Student.classId.
 * Aman dijalankan ulang (idempotent): hanya memproses baris dengan classId NULL + className terisi.
 *
 * Jalankan: npx tsx scripts/migrate-student-class.ts
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/simpus_db?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const pending = await prisma.student.findMany({
    where: { classId: null, className: { not: null } },
    select: { id: true, schoolId: true, className: true },
  });

  let updated = 0;
  let classesCreated = 0;
  const classCache = new Map<string, string>();

  for (const s of pending) {
    const raw = (s.className ?? "").trim();
    if (!raw) continue;
    const key = `${s.schoolId}::${raw.toLowerCase()}`;
    let classId = classCache.get(key);
    if (!classId) {
      const found = await prisma.schoolClass.findFirst({
        where: {
          schoolId: s.schoolId,
          OR: [
            { name: raw },
            { name: { equals: raw, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      if (found) {
        classId = found.id;
      } else {
        const created = await prisma.schoolClass.create({
          data: { schoolId: s.schoolId, name: raw, isActive: true },
          select: { id: true },
        });
        classId = created.id;
        classesCreated += 1;
      }
      classCache.set(key, classId);
    }
    await prisma.student.update({
      where: { id: s.id },
      data: { classId },
    });
    updated += 1;
  }

  console.log(`students updated: ${updated}, classes created: ${classesCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
