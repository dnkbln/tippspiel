import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/errors/app-error.js";

const { requireAuthMock, getCompetitionLeaderboardMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getCompetitionLeaderboardMock: vi.fn(),
}));

vi.mock("../../../src/routes/auth/require-auth.js", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../../../src/services/get-competition-leaderboard.js", () => ({
  getCompetitionLeaderboard: getCompetitionLeaderboardMock,
}));

import { createApp } from "../../../src/app.js";

describe("GET /competitions/:competitionId/leaderboard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the competition leaderboard for an authenticated user", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    getCompetitionLeaderboardMock.mockResolvedValue([
      {
        rank: 1,
        user: { id: "user-2", displayName: "Ben" },
        totalPoints: 7,
      },
      {
        rank: 2,
        user: { id: "user-1", displayName: "Anna" },
        totalPoints: 5,
      },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/leaderboard",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      leaderboard: [
        {
          rank: 1,
          user: { id: "user-2", displayName: "Ben" },
          totalPoints: 7,
        },
        {
          rank: 2,
          user: { id: "user-1", displayName: "Anna" },
          totalPoints: 5,
        },
      ],
    });

    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(getCompetitionLeaderboardMock).toHaveBeenCalledWith("competition-1");

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAuthMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/leaderboard",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(getCompetitionLeaderboardMock).not.toHaveBeenCalled();

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

    getCompetitionLeaderboardMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/leaderboard",
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

  it("returns 500 when loading the leaderboard fails unexpectedly", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    getCompetitionLeaderboardMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/leaderboard",
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

  it("returns an empty leaderboard when no scored tips exist", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    getCompetitionLeaderboardMock.mockResolvedValue([]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/leaderboard",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      leaderboard: [],
    });

    await app.close();
  });
});