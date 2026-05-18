import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, setGameResultMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  setGameResultMock: vi.fn(),
}));

vi.mock("../../../src/routes/auth/require-admin.js", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("../../../src/services/set-game-result.js", () => ({
  setGameResult: setGameResultMock,
}));

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("PATCH /admin/games/:gameId/result", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 and delegates the result update for an authenticated admin", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameResultMock.mockResolvedValue(undefined);

    const payload = {
      homeGoals: 2,
      awayGoals: 1,
      resultDecision: "REGULAR_TIME",
    };

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/result",
      payload,
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(setGameResultMock).toHaveBeenCalledWith("game-1", payload);

    await app.close();
  });

  it("returns 400 when the result update is invalid", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameResultMock.mockRejectedValue(
      new AppError("VALIDATION_ERROR", 400, "resultDecision is required"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/result",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "resultDecision is required",
      },
    });

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/result",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(setGameResultMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 404 when the game does not exist", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameResultMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "game not found"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/result",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "game not found",
      },
    });

    await app.close();
  });

  it("returns 500 when the result update fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameResultMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/result",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
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
