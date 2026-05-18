import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, listTournamentGamesMock } = vi.hoisted(() => {
  return {
    requireAuthMock: vi.fn(),
    listTournamentGamesMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-auth.js", () => {
  return {
    requireAuth: requireAuthMock,
  };
});

vi.mock("../../../src/services/list-tournament-games.js", () => {
  return {
    listTournamentGames: listTournamentGamesMock,
  };
});

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("GET /competitions/:competitionId/games", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns games with UTC kickoff times for an authenticated user", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listTournamentGamesMock.mockResolvedValue([
      {
        id: "game-1",
        startsAt: new Date("2026-06-14T17:00:00.000Z"),
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
        advancingTeamId: null,
        resultEnteredAt: "2026-06-14T20:00:00.000Z",
        group: {
          id: "group-1",
          name: "Gruppe A",
          slug: "gruppe-a",
          order: 1,
        },
        groupRound: 1,
        round: {
          id: "round-1",
          name: "Gruppenphase",
          slug: "gruppenphase",
          order: 1,
        },
        homeTeam: {
          id: "team-1",
          name: "Deutschland",
          slug: "deutschland",
        },
        awayTeam: {
          id: "team-2",
          name: "Frankreich",
          slug: "frankreich",
        },
      },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/games",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      games: [
        {
          id: "game-1",
          startsAt: "2026-06-14T17:00:00.000Z",
          homeGoals: 2,
          awayGoals: 1,
          resultDecision: "REGULAR_TIME",
          advancingTeamId: null,
          resultEnteredAt: "2026-06-14T20:00:00.000Z",
          group: {
            id: "group-1",
            name: "Gruppe A",
            slug: "gruppe-a",
            order: 1,
          },
          groupRound: 1,
          round: {
            id: "round-1",
            name: "Gruppenphase",
            slug: "gruppenphase",
            order: 1,
          },
          homeTeam: {
            id: "team-1",
            name: "Deutschland",
            slug: "deutschland",
          },
          awayTeam: {
            id: "team-2",
            name: "Frankreich",
            slug: "frankreich",
          },
        },
      ],
    });

    expect(response.json().games[0].startsAt).toBe("2026-06-14T17:00:00.000Z");
    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(listTournamentGamesMock).toHaveBeenCalledWith("competition-1");

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAuthMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/games",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(listTournamentGamesMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 500 when listing games fails unexpectedly", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listTournamentGamesMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/games",
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

  it("returns games with placeholders when teams are not fixed yet", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listTournamentGamesMock.mockResolvedValue([
      {
        id: "game-1",
        startsAt: new Date("2026-06-28T17:00:00.000Z"),
        group: null,
        groupRound: null,
        homeTeam: null,
        awayTeam: null,
        homeTeamPlaceholder: "Sieger Gruppe A",
        awayTeamPlaceholder: "Zweiter Gruppe B",
        round: {
          id: "round-1",
          name: "Achtelfinale",
          slug: "achtelfinale",
          order: 2,
        },
      },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/games",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      games: [
        {
          id: "game-1",
          startsAt: "2026-06-28T17:00:00.000Z",
          group: null,
          groupRound: null,
          homeTeam: null,
          awayTeam: null,
          homeTeamPlaceholder: "Sieger Gruppe A",
          awayTeamPlaceholder: "Zweiter Gruppe B",
          round: {
            id: "round-1",
            name: "Achtelfinale",
            slug: "achtelfinale",
            order: 2,
          },
        },
      ],
    });

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

    listTournamentGamesMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions/competition-1/games",
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

});
