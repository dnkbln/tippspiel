import { afterEach, describe, expect, it, vi } from "vitest";

const { loginUserMock } = vi.hoisted(() => {
  return {
    loginUserMock: vi.fn(),
  };
});

vi.mock("../../../src/services/login-user.js", () => {
  return {
    loginUser: loginUserMock,
  };
});

import { AppError } from "../../../src/errors/app-error.js";
import { createApp } from "../../../src/app.js";

describe("POST /auth/login", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200, user payload and session cookie on success", async () => {
    const app = await createApp();

    loginUserMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "USER",
      },
      sessionToken: "session-token",
      sessionExpiresAt: new Date("2026-04-26T10:00:00.000Z"),
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "max@example.com",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "USER",
      },
    });

    expect(response.headers["set-cookie"]).toContain("session=session-token");
    expect(response.headers["set-cookie"]).toContain("HttpOnly");
    expect(response.headers["set-cookie"]).toContain("Path=/");
    expect(response.headers["set-cookie"]).toContain("SameSite=Lax");
    expect(response.headers["set-cookie"]).toContain(
      "Expires=Sun, 26 Apr 2026 10:00:00 GMT",
    );

    expect(loginUserMock).toHaveBeenCalledWith({
      email: "max@example.com",
      password: "geheimespasswort",
    });

    await app.close();
  });

  it("returns 400 when request body is invalid", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: 123,
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "email must be a string",
      },
    });

    expect(loginUserMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("maps AppError from the service to the HTTP response", async () => {
    const app = await createApp();

    loginUserMock.mockRejectedValue(
      new AppError("INVALID_CREDENTIALS", 401, "invalid credentials"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "max@example.com",
        password: "falschespasswort",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "invalid credentials",
      },
    });

    await app.close();
  });

  it("returns 500 when the service throws an unexpected error", async () => {
    const app = await createApp();

    loginUserMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "max@example.com",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
    });

    await app.close();
  });

});
