import { afterEach, describe, expect, it, vi } from "vitest";

const { registerUserMock } = vi.hoisted(() => {
  return {
    registerUserMock: vi.fn()
  };
});

vi.mock("../../../src/services/register-user.js", () => {
  return {
    registerUser: registerUserMock
  };
});

import { AppError } from "../../../src/errors/app-error.js";
import { createApp } from "../../../src/app.js";

describe("POST /auth/register", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 and user payload on success", async () => {
    const app = await createApp();

    registerUserMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER"
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "max@example.com",
        displayName: "Max",
        password: "geheimespasswort",
        invitationCode: "WM2026"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "USER"
      }
    });

    expect(registerUserMock).toHaveBeenCalledWith({
      email: "max@example.com",
      displayName: "Max",
      password: "geheimespasswort",
      invitationCode: "WM2026"
    });

    await app.close();
  });

  it("returns 400 when request body is invalid", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: 123,
        displayName: "Max",
        password: "geheimespasswort",
        invitationCode: "WM2026"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "email must be a string"
      }
    });

    expect(registerUserMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("maps AppError from the service to the HTTP response", async () => {
    const app = await createApp();

    registerUserMock.mockRejectedValue(
      new AppError("EMAIL_ALREADY_EXISTS", 409, "email already exists")
    );

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "max@example.com",
        displayName: "Max",
        password: "geheimespasswort",
        invitationCode: "WM2026"
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "EMAIL_ALREADY_EXISTS",
        message: "email already exists"
      }
    });

    await app.close();
  });
});
