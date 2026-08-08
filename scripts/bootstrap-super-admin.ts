import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const name = process.env.SUPER_ADMIN_NAME ?? "BENZO Super Admin";
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before bootstrapping.");
  }

  const existingSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });

  if (existingSuperAdmin) {
    throw new Error("A super admin already exists. Refusing to create another bootstrap account.");
  }

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash: await argon2.hash(password),
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      adminProfile: { create: {} }
    }
  });

  console.log(`Created super admin ${email}.`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

