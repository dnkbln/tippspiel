import { afterEach, describe, expect, it, vi } from "vitest";
import { listMyCompetitionTips } from "../../src/api/list-my-competition-tips";

describe("listMyCompetitionTips", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the authenticated user's tips for a competition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            tips: [
              {
                gameId: "game-1",
                homeGoals: 2,
                awayGoals: 1,
                advancingTeamId: null,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(listMyCompetitionTips("competition-1")).resolves.toEqual({
      tips: [
        {
          gameId: "game-1",
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
      ],
    });

    expect(fetch).toHaveBeenCalledWith("/competitions/competition-1/my-tips", {
      method: "GET",
    });
  });

  it("throws an ApiError when loading tips fails", async () => {
    const errorPayload = {
      error: { code: "UNAUTHORIZED", message: "authentication required" },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 401 }),
      ),
    );

    await expect(listMyCompetitionTips("competition-1")).rejects.toMatchObject({
      status: 401,
      payload: errorPayload,
      message: "authentication required",
    });
  });
});