import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import argon2 from "argon2";
import { Prisma } from "@prisma/client";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type RegisterUserInput = {
  email: string;
  displayName: string;
  password: string;
  invitationCode: string;
};

export type RegisterUserResult = {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
};

export async function registerUser(
  input: RegisterUserInput
): Promise<RegisterUserResult> {

  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const password = input.password;
  const invitationCode = input.invitationCode.trim();

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

  if (!invitationCode) {
    throw new AppError("VALIDATION_ERROR", 400, "invitationCode is required");
  }

  const existingInvitationCode = await prisma.invitationCode.findUnique({
    where: {
      code: invitationCode
    }
  });

  if (!existingInvitationCode || !existingInvitationCode.isActive) {
    throw new AppError("INVITATION_CODE_INVALID", 403, "invitationCode is invalid");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    throw new AppError("EMAIL_ALREADY_EXISTS", 409, "email already exists");
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id
  });

  try {
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash
      }
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
  } catch (error) {
      if ( error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" ) {
        throw new AppError("EMAIL_ALREADY_EXISTS", 409, "email already exists");
      }
    throw error;
  }
}
