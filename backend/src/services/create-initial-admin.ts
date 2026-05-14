import { createHash } from "crypto";
import argon2 from "argon2";

import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

type CreateInitialAdminInput = {
  bootstrapToken: string;
  email: string;
  displayName: string;
  password: string;
};

type CreateInitialAdminResult = {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "USER";
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createInitialAdmin(
  input: CreateInitialAdminInput,
): Promise<CreateInitialAdminResult> {
  const bootstrapToken = input.bootstrapToken.trim();
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const password = input.password;

  if (!bootstrapToken) {
    throw new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid");
  }

  if (!email) {
    throw new AppError("VALIDATION_ERROR", 400, "email is required");
  }

  if (!isValidEmail(email)) {
    throw new AppError("VALIDATION_ERROR", 400, "email must be valid");
  }

  if (!displayName) {
    throw new AppError("VALIDATION_ERROR", 400, "displayName is required");
  }

  if (!password) {
    throw new AppError("VALIDATION_ERROR", 400, "password is required");
  }

  if (password.length < 8) {
    throw new AppError("VALIDATION_ERROR", 400, "password must be at least 8 characters long");
  }

  const existingAdminCount = await prisma.user.count({
    where: {
      role: "ADMIN",
    },
  });

  if (existingAdminCount > 0) {
    throw new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid");
  }

  const setup = await prisma.bootstrapSetup.findUnique({
    where: {
      id: "initial",
    },
  });

  if (!setup?.tokenHash || setup.completedAt !== null) {
    throw new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid");
  }

  if (setup.tokenHash !== hashToken(bootstrapToken)) {
    throw new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError("EMAIL_ALREADY_EXISTS", 409, "email already exists");
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        role: "ADMIN",
      },
    });

    await tx.bootstrapSetup.update({
      where: {
        id: "initial",
      },
      data: {
        completedAt: new Date(),
        tokenHash: null,
      },
    });

    return createdUser;
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}
