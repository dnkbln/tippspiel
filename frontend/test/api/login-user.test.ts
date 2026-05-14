import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../src/api/register-user";
import { loginUser } from "../../src/api/login-user";

const payload = {
  email: "max@example.com",
  password: "geheimespasswort",
};

describe("loginUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the login payload to the backend endpoint", async () => {
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
        { status: 200 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(loginUser(payload)).resolves.toEqual({
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "USER",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  });

  it("throws an ApiError with the backend payload when login fails", async () => {
    const errorPayload = {
      error: {
        code: "INVALID_CREDENTIALS",
        message: "invalid credentials",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 401,
        }),
      ),
    );

    await expect(loginUser(payload)).rejects.toMatchObject({
      status: 401,
      payload: errorPayload,
      message: "invalid credentials",
    });
  });
});
