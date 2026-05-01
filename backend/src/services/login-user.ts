import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import argon2 from "argon2";
import { randomBytes, createHash } from "crypto";

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserResult = {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: "USER" | "ADMIN";
  };
  sessionToken: string;
  sessionExpiresAt: Date;
};

export async function loginUser(input: LoginUserInput): Promise<LoginUserResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email) {
    throw new AppError("VALIDATION_ERROR", 400, "email is required");
  }

  if (!password) {
    throw new AppError("VALIDATION_ERROR", 400, "password is required");
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("INVALID_CREDENTIALS", 401, "invalid credentials");
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password);

  if (!passwordMatches) {
    throw new AppError("INVALID_CREDENTIALS", 401, "invalid credentials");
  }

  const sessionToken = randomBytes(32).toString("hex");
  const sessionTokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const sessionExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sessionTokenHash,
      expiresAt: sessionExpiresAt
    }
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    },
    sessionToken,
    sessionExpiresAt
  };
}
