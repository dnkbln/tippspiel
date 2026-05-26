import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/errors/app-error.js";

const { requireAuthMock, listMyCompetitionTipsMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  listMyCompetitionTipsMock: vi.fn(),
}));

vi.mock("../../../src/routes/auth/require-auth.js", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../../../src/services/list-my-competition-tips.js", () => ({
  listMyCompetitionTips: listMyCompetitionTipsMock,
}));

import { createApp } from "../../../src/app.js";

describe("GET /competitions/:competitionId/my-tips", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user's tips for the competition", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listMyCompetitionTipsMock.mockResolvedValue([
      {
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
      },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/my-tips",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      tips: [
        {
          gameId: "game-1",
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
      ],
    });

    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(listMyCompetitionTipsMock).toHaveBeenCalledWith(
      "user-1",
      "competition-1",
    );

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAuthMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/my-tips",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(listMyCompetitionTipsMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 404 when the competition does not exist", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listMyCompetitionTipsMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/my-tips",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "competition not found",
      },
    });

    await app.close();
  });

  it("returns 500 when listing tips fails unexpectedly", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listMyCompetitionTipsMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/my-tips",
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

  it("returns an empty list when the authenticated user has no tips for the competition", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listMyCompetitionTipsMock.mockResolvedValue([]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/my-tips",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      tips: [],
    });

    expect(listMyCompetitionTipsMock).toHaveBeenCalledWith(
      "user-1",
      "competition-1",
    );

    await app.close();
  });
});