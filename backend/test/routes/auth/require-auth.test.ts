import { describe, expect, it, vi } from "vitest";

const { getAuthenticatedUserMock } = vi.hoisted(() => {
  return {
    getAuthenticatedUserMock: vi.fn(),
  };
});

vi.mock("../../../src/services/get-authenticated-user.js", () => {
  return {
    getAuthenticatedUser: getAuthenticatedUserMock,
  };
});

import { requireAuth } from "../../../src/routes/auth/require-auth.js";

describe("requireAuth", () => {
  it("returns the authenticated user for a valid session cookie", async () => {
    getAuthenticatedUserMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "ADMIN",
    });

    const result = await requireAuth({
      headers: {
        cookie: "theme=light; session=session-token",
      },
    });

    expect(result).toEqual({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "ADMIN",
    });

    expect(getAuthenticatedUserMock).toHaveBeenCalledWith("session-token");
  });

  it("throws when no authenticated user can be resolved", async () => {
    getAuthenticatedUserMock.mockResolvedValue(null);

    await expect(
      requireAuth({
        headers: {},
      }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      statusCode: 401,
      message: "authentication required",
    });

    expect(getAuthenticatedUserMock).toHaveBeenCalledWith(null);
  });
});
