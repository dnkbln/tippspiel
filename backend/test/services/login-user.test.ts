import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "crypto";

const { prismaMock, argon2Mock } = vi.hoisted(() => {
  return {
    prismaMock: {
      user: {
        findUnique: vi.fn(),
      },
      session: {
        create: vi.fn(),
      },
    },
    argon2Mock: {
      verify: vi.fn(),
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

vi.mock("argon2", () => {
  return {
    default: argon2Mock,
  };
});

import { loginUser } from "../../src/services/login-user.js";

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("logs in a user and creates a session", async () => {
    const now = new Date("2026-04-19T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      passwordHash: "hashed-password",
      role: "USER",
    });
    argon2Mock.verify.mockResolvedValue(true);
    prismaMock.session.create.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      tokenHash: "stored-token-hash",
      expiresAt: new Date("2026-04-26T10:00:00.000Z"),
      createdAt: now,
    });

    const result = await loginUser({
      email: "  Max@Example.com ",
      password: "geheimespasswort",
    });

    expect(result.user).toEqual({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });
    expect(result.sessionToken).toEqual(expect.any(String));
    expect(result.sessionToken).toHaveLength(64);
    expect(result.sessionExpiresAt).toEqual(new Date("2026-04-26T10:00:00.000Z"));

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "max@example.com",
      },
    });
    expect(argon2Mock.verify).toHaveBeenCalledWith(
      "hashed-password",
      "geheimespasswort",
    );
    expect(prismaMock.session.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        tokenHash: createHash("sha256").update(result.sessionToken).digest("hex"),
        expiresAt: new Date("2026-04-26T10:00:00.000Z"),
      },
    });
  });

  it("throws when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser({
        email: "max@example.com",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
      message: "invalid credentials",
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "max@example.com",
      },
    });
    expect(argon2Mock.verify).not.toHaveBeenCalled();
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("throws when password does not match", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      passwordHash: "hashed-password",
      role: "USER",
    });
    argon2Mock.verify.mockResolvedValue(false);

    await expect(
      loginUser({
        email: "max@example.com",
        password: "falschespasswort",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
      message: "invalid credentials",
    });

    expect(argon2Mock.verify).toHaveBeenCalledWith(
      "hashed-password",
      "falschespasswort",
    );
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("throws when email is empty", async () => {
    await expect(
      loginUser({
        email: "   ",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "email is required",
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(argon2Mock.verify).not.toHaveBeenCalled();
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("throws when password is empty", async () => {
    await expect(
      loginUser({
        email: "max@example.com",
        password: "",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "password is required",
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(argon2Mock.verify).not.toHaveBeenCalled();
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });
});
