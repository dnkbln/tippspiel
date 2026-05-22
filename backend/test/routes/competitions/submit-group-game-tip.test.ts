import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, submitGroupGameTipMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  submitGroupGameTipMock: vi.fn(),
}));

vi.mock("../../../src/routes/auth/require-auth.js", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../../../src/services/submit-group-game-tip.js", () => ({
  submitGroupGameTip: submitGroupGameTipMock,
}));

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("POST /competitions/:competitionId/games/:gameId/tip", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("stores a tip for an authenticated user", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    submitGroupGameTipMock.mockResolvedValue({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 2,
      awayGoals: 1,
      advancingTeamId: null,
    });

    const response = await app.inject({
      method: "POST",
      url: "/competitions/competition-1/games/game-1/tip",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      tip: {
        id: "tip-1",
        userId: "user-1",
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
      },
    });

    expect(submitGroupGameTipMock).toHaveBeenCalledWith(
      "user-1",
      "competition-1",
      "game-1",
      {
        homeGoals: 2,
        awayGoals: 1,
      },
    );

    await app.close();
  });

  it("stores a knockout draw tip for an authenticated user", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    submitGroupGameTipMock.mockResolvedValue({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 1,
      awayGoals: 1,
      advancingTeamId: "team-2",
    });

    const response = await app.inject({
      method: "POST",
      url: "/competitions/competition-1/games/game-1/tip",
      payload: {
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      tip: {
        id: "tip-1",
        userId: "user-1",
        gameId: "game-1",
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
      },
    });

    expect(submitGroupGameTipMock).toHaveBeenCalledWith(
      "user-1",
      "competition-1",
      "game-1",
      {
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
      },
    );

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAuthMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/competitions/competition-1/games/game-1/tip",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(submitGroupGameTipMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 400 when the tip is invalid", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    submitGroupGameTipMock.mockRejectedValue(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "advancingTeamId is not allowed for group game tips",
      ),
    );

    const response = await app.inject({
      method: "POST",
      url: "/competitions/competition-1/games/game-1/tip",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: "team-1",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "advancingTeamId is not allowed for group game tips",
      },
    });

    await app.close();
  });

  it("returns 404 when the game does not exist in the competition", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    submitGroupGameTipMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "game not found"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/competitions/competition-1/games/game-1/tip",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
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

  it("returns 500 when storing the tip fails unexpectedly", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    submitGroupGameTipMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "POST",
      url: "/competitions/competition-1/games/game-1/tip",
      payload: {
        homeGoals: 2,
        awayGoals: 1,
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
