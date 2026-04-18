import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, argon2Mock } = vi.hoisted(() => {
  return {
    prismaMock: {
      invitationCode: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
    argon2Mock: {
      hash: vi.fn(),
      argon2id: 2,
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

import { registerUser } from "../../src/services/register-user.js";

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a user with a valid invitation code", async () => {
    prismaMock.invitationCode.findUnique.mockResolvedValue({
      id: "invite-1",
      code: "WM2026",
      isActive: true,
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    argon2Mock.hash.mockResolvedValue("hashed-password");

    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      passwordHash: "hashed-password",
      role: "USER",
    });

    const result = await registerUser({
      email: "  Max@Example.com ",
      displayName: " Max ",
      password: "geheimespasswort",
      invitationCode: "WM2026",
    });

    expect(result).toEqual({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    expect(prismaMock.invitationCode.findUnique).toHaveBeenCalledWith({
      where: {
        code: "WM2026",
      },
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "max@example.com",
      },
    });

    expect(argon2Mock.hash).toHaveBeenCalledWith("geheimespasswort", {
      type: argon2Mock.argon2id,
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "max@example.com",
        displayName: "Max",
        passwordHash: "hashed-password",
      },
    });
  });

  it("throws when invitation code is invalid", async () => {
    prismaMock.invitationCode.findUnique.mockResolvedValue(null);

    await expect(
      registerUser({
        email: "max@example.com",
        displayName: "Max",
        password: "geheimespasswort",
        invitationCode: "INVALID",
      }),
    ).rejects.toMatchObject({
      code: "INVITATION_CODE_INVALID",
      statusCode: 403,
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("throws when email already exists", async () => {
    prismaMock.invitationCode.findUnique.mockResolvedValue({
      id: "invite-1",
      code: "WM2026",
      isActive: true,
    });

    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "max@example.com",
      displayName: "Existing Max",
      passwordHash: "existing-hash",
      role: "USER",
    });

    await expect(
      registerUser({
        email: "Max@Example.com",
        displayName: "Max",
        password: "geheimespasswort",
        invitationCode: "WM2026",
      }),
    ).rejects.toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
      statusCode: 409,
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "max@example.com",
      },
    });

    expect(argon2Mock.hash).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("throws when email is invalid", async () => {
    await expect(
      registerUser({
        email: "not-an-email",
        displayName: "Max",
        password: "geheimespasswort",
        invitationCode: "WM2026",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "email must be valid",
    });

    expect(prismaMock.invitationCode.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(argon2Mock.hash).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

});
