import { describe, expect, it, vi } from "vitest";

const { requireAuthMock } = vi.hoisted(() => {
  return {
    requireAuthMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-auth.js", () => {
  return {
    requireAuth: requireAuthMock,
  };
});

import { requireAdmin } from "../../../src/routes/auth/require-admin.js";

describe("requireAdmin", () => {
  it("returns the authenticated user when the user is an admin", async () => {
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "ADMIN",
    });

    const result = await requireAdmin({
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(result).toEqual({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "ADMIN",
    });
  });

  it("throws when the authenticated user is not an admin", async () => {
    requireAuthMock.mockResolvedValue({
      id: "user-2",
      email: "lea@example.com",
      displayName: "Lea",
      role: "USER",
    });

    await expect(
      requireAdmin({
        headers: {
          cookie: "session=session-token",
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      statusCode: 403,
      message: "admin access required",
    });
  });
});
