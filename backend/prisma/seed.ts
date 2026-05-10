import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const invitationCode = process.env.TIPPSPIEL_INVITATION_CODE ?? "WM2026";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run development seed in production");
}

try {
  await prisma.invitationCode.upsert({
    where: {
      code: invitationCode,
    },
    update: {
      isActive: true,
    },
    create: {
      code: invitationCode,
      isActive: true,
    },
  });

  console.log(`Seeded active invitation code: ${invitationCode}`);
} finally {
  await prisma.$disconnect();
}
