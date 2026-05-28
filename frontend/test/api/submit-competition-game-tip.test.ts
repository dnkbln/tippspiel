import { afterEach, describe, expect, it, vi } from "vitest";

import { submitCompetitionGameTip } from "../../src/api/submit-competition-game-tip";

describe("submitCompetitionGameTip", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits a game tip to the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            tip: {
              id: "tip-1",
              userId: "user-1",
              gameId: "game-1",
              homeGoals: 2,
              awayGoals: 1,
              advancingTeamId: null,
            },
          }),
          { status: 201 },
        ),
      ),
    );

    await expect(
      submitCompetitionGameTip("competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
      }),
    ).resolves.toEqual({
      tip: {
        id: "tip-1",
        userId: "user-1",
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
      },
    });

    expect(fetch).toHaveBeenCalledWith("/competitions/competition-1/games/game-1/tip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        homeGoals: 2,
        awayGoals: 1,
      }),
    });
  });

  it("supports knockout draw tips with advancingTeamId", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            tip: {
              id: "tip-1",
              userId: "user-1",
              gameId: "game-1",
              homeGoals: 1,
              awayGoals: 1,
              advancingTeamId: "team-2",
            },
          }),
          { status: 201 },
        ),
      ),
    );

    await submitCompetitionGameTip("competition-1", "game-1", {
      homeGoals: 1,
      awayGoals: 1,
      advancingTeamId: "team-2",
    });

    expect(fetch).toHaveBeenCalledWith(
      "/competitions/competition-1/games/game-1/tip",
      expect.objectContaining({
        body: JSON.stringify({
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-2",
        }),
      }),
    );
  });

  it("throws an ApiError when submitting the tip fails", async () => {
    const errorPayload = {
      error: { code: "VALIDATION_ERROR", message: "tip deadline has passed" },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 400 }),
      ),
    );

    await expect(
      submitCompetitionGameTip("competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
      }),
    ).rejects.toMatchObject({
      status: 400,
      payload: errorPayload,
      message: "tip deadline has passed",
    });
  });
});