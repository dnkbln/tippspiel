import { afterEach, describe, expect, it, vi } from "vitest";

const { createInitialAdminMock } = vi.hoisted(() => {
  return {
    createInitialAdminMock: vi.fn(),
  };
});

vi.mock("../../../src/services/create-initial-admin.js", () => {
  return {
    createInitialAdmin: createInitialAdminMock,
  };
});

import { AppError } from "../../../src/errors/app-error.js";
import { createApp } from "../../../src/app.js";

describe("POST /setup/initial-admin", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 and user payload with a valid Bootstrap authorization header", async () => {
    const app = await createApp();

    createInitialAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    const response = await app.inject({
      method: "POST",
      url: "/setup/initial-admin",
      headers: {
        authorization: "Bootstrap bootstrap-token",
      },
      payload: {
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      user: {
        id: "admin-1",
        email: "admin@example.com",
        displayName: "Admin",
        role: "ADMIN",
      },
    });

    expect(createInitialAdminMock).toHaveBeenCalledWith({
      bootstrapToken: "bootstrap-token",
      email: "admin@example.com",
      displayName: "Admin",
      password: "geheimespasswort",
    });

    await app.close();
  });

  it("returns 403 when the Bootstrap authorization header is missing", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "POST",
      url: "/setup/initial-admin",
      payload: {
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "BOOTSTRAP_TOKEN_INVALID",
        message: "bootstrap token is invalid",
      },
    });

    expect(createInitialAdminMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("maps AppError from the service to the HTTP response", async () => {
    const app = await createApp();

    createInitialAdminMock.mockRejectedValue(
      new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/setup/initial-admin",
      headers: {
        authorization: "Bootstrap wrong-token",
      },
      payload: {
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "BOOTSTRAP_TOKEN_INVALID",
        message: "bootstrap token is invalid",
      },
    });

    await app.close();
  });

  it("returns 403 when the authorization scheme is not Bootstrap", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "POST",
      url: "/setup/initial-admin",
      headers: {
        authorization: "Bearer bootstrap-token",
      },
      payload: {
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "BOOTSTRAP_TOKEN_INVALID",
        message: "bootstrap token is invalid",
      },
    });

    expect(createInitialAdminMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 403 when the Bootstrap authorization header has no token", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "POST",
      url: "/setup/initial-admin",
      headers: {
        authorization: "Bootstrap ",
      },
      payload: {
        email: "admin@example.com",
        displayName: "Admin",
        password: "geheimespasswort",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "BOOTSTRAP_TOKEN_INVALID",
        message: "bootstrap token is invalid",
      },
    });

    expect(createInitialAdminMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 400 when request body is invalid", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "POST",
      url: "/setup/initial-admin",
      headers: {
        authorization: "Bootstrap bootstrap-token",
      },
      payload: {
        email: 123,
        displayName: "Admin",
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

    expect(createInitialAdminMock).not.toHaveBeenCalled();

    await app.close();
  });

});
