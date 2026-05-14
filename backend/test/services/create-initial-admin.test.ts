import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, argon2Mock } = vi.hoisted(() => {
  return {
    prismaMock: {
      $transaction: vi.fn(async (callback) => callback(prismaMock)),
      user: {
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      bootstrapSetup: {
        findUnique: vi.fn(),
        update: vi.fn(),
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

import { createInitialAdmin } from "../../src/services/create-initial-admin.js";

describe("createInitialAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the first admin with a valid bootstrap token hash", async () => {
    const token = "bootstrap-token";
    const tokenHash = createHash("sha256").update(token).digest("hex");

    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.bootstrapSetup.findUnique.mockResolvedValue({
      id: "initial",
      tokenHash,
      completedAt: null,
    });
    prismaMock.user.findUnique.mockResolvedValue(null);
    argon2Mock.hash.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      passwordHash: "hashed-password",
      role: "ADMIN",
    });

    const result = await createInitialAdmin({
      bootstrapToken: token,
      email: " Admin@Example.com ",
      displayName: " Admin ",
      password: "geheimespasswort",
    });

    expect(result).toEqual({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);


    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "admin@example.com",
        displayName: "Admin",
        passwordHash: "hashed-password",
        role: "ADMIN",
      },
    });

    expect(prismaMock.bootstrapSetup.update).toHaveBeenCalledWith({
      where: { id: "initial" },
      data: {
        completedAt: expect.any(Date),
        tokenHash: null,
      },
    });
  });

  it("rejects generically when an admin already exists", async () => {
    prismaMock.user.count.mockResolvedValue(1);

    await expect(
      createInitialAdmin({
        bootstrapToken: "bootstrap-token",
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "BOOTSTRAP_TOKEN_INVALID",
      statusCode: 403,
      message: "bootstrap token is invalid",
    });

    expect(prismaMock.bootstrapSetup.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.bootstrapSetup.update).not.toHaveBeenCalled();
  });

  it("rejects generically when the bootstrap token does not match", async () => {
    const storedTokenHash = createHash("sha256").update("expected-token").digest("hex");

    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.bootstrapSetup.findUnique.mockResolvedValue({
      id: "initial",
      tokenHash: storedTokenHash,
      completedAt: null,
    });

    await expect(
      createInitialAdmin({
        bootstrapToken: "wrong-token",
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "BOOTSTRAP_TOKEN_INVALID",
      statusCode: 403,
      message: "bootstrap token is invalid",
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.bootstrapSetup.update).not.toHaveBeenCalled();
  });

  it("rejects generically when bootstrap setup is already completed", async () => {
    const tokenHash = createHash("sha256").update("bootstrap-token").digest("hex");

    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.bootstrapSetup.findUnique.mockResolvedValue({
      id: "initial",
      tokenHash,
      completedAt: new Date("2026-05-11T10:00:00.000Z"),
    });

    await expect(
      createInitialAdmin({
        bootstrapToken: "bootstrap-token",
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "BOOTSTRAP_TOKEN_INVALID",
      statusCode: 403,
      message: "bootstrap token is invalid",
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.bootstrapSetup.update).not.toHaveBeenCalled();
  });

  it("rejects generically when no bootstrap setup exists", async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.bootstrapSetup.findUnique.mockResolvedValue(null);

    await expect(
      createInitialAdmin({
        bootstrapToken: "bootstrap-token",
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "BOOTSTRAP_TOKEN_INVALID",
      statusCode: 403,
      message: "bootstrap token is invalid",
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.bootstrapSetup.update).not.toHaveBeenCalled();
  });

  it("rejects generically when no bootstrap token hash is stored", async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.bootstrapSetup.findUnique.mockResolvedValue({
      id: "initial",
      tokenHash: null,
      completedAt: null,
    });

    await expect(
      createInitialAdmin({
        bootstrapToken: "bootstrap-token",
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      }),
    ).rejects.toMatchObject({
      code: "BOOTSTRAP_TOKEN_INVALID",
      statusCode: 403,
      message: "bootstrap token is invalid",
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.bootstrapSetup.update).not.toHaveBeenCalled();
  });

});
