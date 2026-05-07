import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, importTournamentScheduleMock } = vi.hoisted(() => {
  return {
    requireAdminMock: vi.fn(),
    importTournamentScheduleMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-admin.js", () => {
  return {
    requireAdmin: requireAdminMock,
  };
});

vi.mock("../../../src/services/import-tournament-schedule.js", () => {
  return {
    importTournamentSchedule: importTournamentScheduleMock,
  };
});

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("POST /admin/import/tournament-schedule", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 and delegates the payload for an authenticated admin", async () => {
    const app = await createApp();

    const payload = {
      competition: {
        name: "Fussball-WM 2026",
        slug: "fussball-wm-2026",
      },
      teams: [],
      rounds: [],
      games: [],
    };

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    importTournamentScheduleMock.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "POST",
      url: "/admin/import/tournament-schedule",
      payload,
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");

    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(importTournamentScheduleMock).toHaveBeenCalledWith(payload);

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/admin/import/tournament-schedule",
      payload: {
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [],
        games: [],
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(importTournamentScheduleMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 403 when the authenticated user is not an admin", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "admin access required"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/admin/import/tournament-schedule",
      payload: {
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [],
        games: [],
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "admin access required",
      },
    });

    expect(importTournamentScheduleMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 400 when the import payload is invalid", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    importTournamentScheduleMock.mockRejectedValue(
      new AppError("VALIDATION_ERROR", 400, "competition.slug is required"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/admin/import/tournament-schedule",
      payload: {
        competition: {
          name: "Fussball-WM 2026",
        },
        teams: [],
        rounds: [],
        games: [],
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "competition.slug is required",
      },
    });

    expect(importTournamentScheduleMock).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it("returns 500 when the import service fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    importTournamentScheduleMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "POST",
      url: "/admin/import/tournament-schedule",
      payload: {
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [],
        games: [],
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
