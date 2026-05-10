import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, registerUser } from "../../src/api/register-user";

const payload = {
  email: "max@example.com",
  displayName: "Max",
  password: "geheimespasswort",
  invitationCode: "WM2026",
};

describe("registerUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the registration payload to the backend endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: "user-1",
            email: "max@example.com",
            displayName: "Max",
            role: "USER",
          },
        }),
        { status: 201 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(registerUser(payload)).resolves.toEqual({
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "USER",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  });

  it("throws an ApiError with the backend payload when registration fails", async () => {
    const errorPayload = {
      error: {
        code: "EMAIL_ALREADY_EXISTS",
        message: "email already exists",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 409,
        }),
      ),
    );

    await expect(registerUser(payload)).rejects.toMatchObject({
      status: 409,
      payload: errorPayload,
      message: "email already exists",
    });
  });
});
