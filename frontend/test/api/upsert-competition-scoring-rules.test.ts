import { afterEach, describe, expect, it, vi } from "vitest";

import { upsertCompetitionScoringRules } from "../../src/api/upsert-competition-scoring-rules";

describe("upsertCompetitionScoringRules", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores scoring rules through the admin endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            scoringRules: {
              id: "rules-1",
              competitionId: "competition-1",
              exactScorePoints: 3,
              goalDifferencePoints: 2,
              tendencyPoints: 1,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      upsertCompetitionScoringRules("competition-1", {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      }),
    ).resolves.toEqual({
      scoringRules: {
        id: "rules-1",
        competitionId: "competition-1",
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/admin/competitions/competition-1/scoring-rules",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exactScorePoints: 3,
          goalDifferencePoints: 2,
          tendencyPoints: 1,
        }),
      },
    );
  });

  it("throws an ApiError when storing scoring rules fails", async () => {
    const errorPayload = {
      error: {
        code: "VALIDATION_ERROR",
        message: "scoring rules can only be changed before first kickoff",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 400 }),
      ),
    );

    await expect(
      upsertCompetitionScoringRules("competition-1", {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      }),
    ).rejects.toMatchObject({
      status: 400,
      payload: errorPayload,
      message: "scoring rules can only be changed before first kickoff",
    });
  });
});
