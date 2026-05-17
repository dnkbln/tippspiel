import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, updateCompetitionMock } = vi.hoisted(() => {
  return {
    requireAdminMock: vi.fn(),
    updateCompetitionMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-admin.js", () => {
  return {
    requireAdmin: requireAdminMock,
  };
});

vi.mock("../../../src/services/update-competition.js", () => {
  return {
    updateCompetition: updateCompetitionMock,
  };
});

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("PATCH /admin/competitions/:competitionId", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the updated competition for an authenticated admin", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    updateCompetitionMock.mockResolvedValue({
      id: "competition-1",
      name: "WM 2026 korrigiert",
      slug: "wm-2026",
    });

    const payload = {
      name: "WM 2026 korrigiert",
    };

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/competitions/competition-1",
      payload,
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      competition: {
        id: "competition-1",
        name: "WM 2026 korrigiert",
        slug: "wm-2026",
      },
    });

    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(updateCompetitionMock).toHaveBeenCalledWith("competition-1", payload);

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/competitions/competition-1",
      payload: {
        name: "WM 2026 korrigiert",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(updateCompetitionMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 403 when the authenticated user is not an admin", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "admin access required"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/competitions/competition-1",
      payload: {
        name: "WM 2026 korrigiert",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "admin access required",
      },
    });

    expect(updateCompetitionMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns service validation errors", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    updateCompetitionMock.mockRejectedValue(
      new AppError("VALIDATION_ERROR", 400, "name is required"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/competitions/competition-1",
      payload: {
        name: " ",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "name is required",
      },
    });

    await app.close();
  });

  it("returns 500 when the update fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    updateCompetitionMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/competitions/competition-1",
      payload: {
        name: "WM 2026 korrigiert",
      },
      headers: {
        cookie: "session=session-token",
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
