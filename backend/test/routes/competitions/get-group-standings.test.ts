import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, getGroupStandingsMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getGroupStandingsMock: vi.fn(),
}));

vi.mock("../../../src/routes/auth/require-auth.js", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../../../src/services/get-group-standings.js", () => ({
  getGroupStandings: getGroupStandingsMock,
}));

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("GET /competitions/:competitionId/groups/:groupSlug/standings", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns group standings for an authenticated user", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    getGroupStandingsMock.mockResolvedValue([
      {
        rank: 1,
        team: { id: "team-1", name: "Deutschland", slug: "deutschland" },
        played: 2,
        won: 1,
        drawn: 1,
        lost: 0,
        goalsFor: 2,
        goalsAgainst: 1,
        goalDifference: 1,
        points: 4,
      },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/groups/gruppe-a/standings",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      standings: [
        {
          rank: 1,
          team: { id: "team-1", name: "Deutschland", slug: "deutschland" },
          played: 2,
          won: 1,
          drawn: 1,
          lost: 0,
          goalsFor: 2,
          goalsAgainst: 1,
          goalDifference: 1,
          points: 4,
        },
      ],
    });

    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(getGroupStandingsMock).toHaveBeenCalledWith(
      "competition-1",
      "gruppe-a",
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
      url: "/competitions/competition-1/groups/gruppe-a/standings",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(getGroupStandingsMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 404 when the competition or group does not exist", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    getGroupStandingsMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "group not found"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/groups/gruppe-a/standings",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "group not found",
      },
    });

    await app.close();
  });

  it("returns 500 when calculating standings fails unexpectedly", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    getGroupStandingsMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/groups/gruppe-a/standings",
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
