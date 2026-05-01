import { createHash } from "crypto";
import { prisma } from "../lib/prisma.js";

export async function logoutUser(sessionToken: string | null): Promise<void> {
  if (!sessionToken) {
    return;
  }

  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");

  await prisma.session.deleteMany({
    where: {
      tokenHash,
    },
  });
}
