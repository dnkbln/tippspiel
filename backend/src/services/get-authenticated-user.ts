import { createHash } from "crypto";
import { prisma } from "../lib/prisma.js";

export async function getAuthenticatedUser(
  sessionToken: string | null,
): Promise<{
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
} | null> {
  if (!sessionToken) {
    return null;
  }

  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }


  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    role: session.user.role,
  };
}
