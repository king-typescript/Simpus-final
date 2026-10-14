import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await argon2.hash("SuperAdmin123!");
  const defaultSchool = await prisma.school.findUnique({ where: { code: "DEFAULT" } });
  if (!defaultSchool) throw new Error("Default school not found");

  const superAdmin = await prisma.user.upsert({
    where: { schoolId_username: { schoolId: defaultSchool.id, username: "superadmin" } },
    update: {
      role: "SUPERADMIN",
      status: "AKTIF",
      name: "Satak Super Administrator",
    },
    create: {
      schoolId: defaultSchool.id,
      username: "superadmin",
      passwordHash,
      role: "SUPERADMIN",
      status: "AKTIF",
      name: "Satak Super Administrator",
    },
  });

  console.log("SuperAdmin seeded successfully:", superAdmin.username);
}

main().catch(console.error).finally(() => prisma.$disconnect());
