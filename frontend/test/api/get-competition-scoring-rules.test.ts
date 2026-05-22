import { afterEach, describe, expect, it, vi } from "vitest";

import { getCompetitionScoringRules } from "../../src/api/get-competition-scoring-rules";

describe("getCompetitionScoringRules", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads stored scoring rules and default suggestion through the admin endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            scoringRules: {
              id: "rules-1",
              competitionId: "competition-1",
              exactScorePoints: 4,
              goalDifferencePoints: 2,
              tendencyPoints: 1,
            },
            defaultSuggestion: {
              exactScorePoints: 3,
              goalDifferencePoints: 2,
              tendencyPoints: 1,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getCompetitionScoringRules("competition-1")).resolves.toEqual({
      scoringRules: {
        id: "rules-1",
        competitionId: "competition-1",
        exactScorePoints: 4,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/admin/competitions/competition-1/scoring-rules",
      {
        method: "GET",
      },
    );
  });

  it("throws an ApiError when loading scoring rules fails", async () => {
    const errorPayload = {
      error: {
        code: "NOT_FOUND",
        message: "competition not found",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 404 }),
      ),
    );

    await expect(
      getCompetitionScoringRules("competition-1"),
    ).rejects.toMatchObject({
      status: 404,
      payload: errorPayload,
      message: "competition not found",
    });
  });
});
