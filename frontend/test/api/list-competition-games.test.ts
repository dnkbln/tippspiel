import { afterEach, describe, expect, it, vi } from "vitest";

import { listCompetitionGames } from "../../src/api/list-competition-games";

describe("listCompetitionGames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads games for a competition from the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            games: [
              {
                id: "game-1",
                startsAt: "2026-06-14T17:00:00.000Z",
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
                homeGoals: 2,
                awayGoals: 1,
                resultDecision: "REGULAR_TIME",
                advancingTeamId: null,
                resultEnteredAt: "2026-06-14T20:00:00.000Z",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(listCompetitionGames("competition-1")).resolves.toEqual({
      games: [
        {
          id: "game-1",
          startsAt: "2026-06-14T17:00:00.000Z",
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
          homeGoals: 2,
          awayGoals: 1,
          resultDecision: "REGULAR_TIME",
          advancingTeamId: null,
          resultEnteredAt: "2026-06-14T20:00:00.000Z",
        },
      ],
    });

    expect(fetch).toHaveBeenCalledWith("/competitions/competition-1/games", {
      method: "GET",
    });
  });

  it("throws an ApiError when loading games fails", async () => {
    const errorPayload = {
      error: { code: "UNAUTHORIZED", message: "authentication required" },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 401 }),
      ),
    );

    await expect(listCompetitionGames("competition-1")).rejects.toMatchObject({
      status: 401,
      payload: errorPayload,
      message: "authentication required",
    });
  });
});
