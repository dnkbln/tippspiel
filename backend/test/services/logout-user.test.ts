import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "crypto";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      session: {
        deleteMany: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { logoutUser } from "../../src/services/logout-user.js";

describe("logoutUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates the current session", async () => {
    prismaMock.session.deleteMany.mockResolvedValue({
      count: 1,
    });

    await expect(logoutUser("session-token")).resolves.toBeUndefined();

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash("sha256").update("session-token").digest("hex"),
      },
    });
  });

  it("does nothing when no session token is provided", async () => {
    await expect(logoutUser(null)).resolves.toBeUndefined();

    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });

});
