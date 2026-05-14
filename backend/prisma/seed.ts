import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const invitationCode = process.env.TIPPSPIEL_INVITATION_CODE ?? "WM2026";
const bootstrapToken = process.env.TIPPSPIEL_BOOTSTRAP_TOKEN;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

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

  if (bootstrapToken) {
    const existingBootstrapSetup = await prisma.bootstrapSetup.findUnique({
      where: {
        id: "initial",
      },
    });

    if (existingBootstrapSetup?.completedAt) {
      console.log("Initial admin bootstrap setup already completed; skipping seed");
    } else {
      await prisma.bootstrapSetup.upsert({
        where: {
          id: "initial",
        },
        update: {
          tokenHash: hashToken(bootstrapToken),
        },
        create: {
          id: "initial",
          tokenHash: hashToken(bootstrapToken),
        },
      });

      console.log("Seeded initial admin bootstrap setup");
    }
  }

} finally {
  await prisma.$disconnect();
}
