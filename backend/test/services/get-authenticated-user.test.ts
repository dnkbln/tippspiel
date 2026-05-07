import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "crypto";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      session: {
        findUnique: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { getAuthenticatedUser } from "../../src/services/get-authenticated-user.js";

describe("getAuthenticatedUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("returns the authenticated user for a valid session token", async () => {
    const now = new Date("2026-05-01T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      tokenHash: "stored-hash",
      expiresAt: new Date("2026-05-08T10:00:00.000Z"),
      createdAt: new Date("2026-05-01T09:00:00.000Z"),
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "ADMIN",
      },
    });

    const result = await getAuthenticatedUser("session-token");

    expect(result).toEqual({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "ADMIN",
    });

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash("sha256").update("session-token").digest("hex"),
      },
      include: {
        user: true,
      },
    });
  });

  it("returns null when no session token is provided", async () => {
    await expect(getAuthenticatedUser(null)).resolves.toBeNull();

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the session does not exist", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(getAuthenticatedUser("unknown-token")).resolves.toBeNull();

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash("sha256").update("unknown-token").digest("hex"),
      },
      include: {
        user: true,
      },
    });
  });

  it("returns null when the session is expired", async () => {
    const now = new Date("2026-05-01T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      tokenHash: "stored-hash",
      expiresAt: new Date("2026-05-01T09:59:59.000Z"),
      createdAt: new Date("2026-05-01T09:00:00.000Z"),
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "ADMIN",
      },
    });

    await expect(getAuthenticatedUser("expired-token")).resolves.toBeNull();

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash("sha256").update("expired-token").digest("hex"),
      },
      include: {
        user: true,
      },
    });
  });

});
