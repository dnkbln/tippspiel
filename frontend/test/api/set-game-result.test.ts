import { afterEach, describe, expect, it, vi } from "vitest";

import { setGameResult } from "../../src/api/set-game-result";

describe("setGameResult", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores a game result through the admin endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(
      setGameResult("game-1", {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      }),
    ).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith("/admin/games/game-1/result", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      }),
    });
  });

  it("supports penalty results with an advancing team", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await setGameResult("game-1", {
      homeGoals: 1,
      awayGoals: 1,
      resultDecision: "PENALTIES",
      advancingTeamId: "team-2",
    });

    expect(fetch).toHaveBeenCalledWith(
      "/admin/games/game-1/result",
      expect.objectContaining({
        body: JSON.stringify({
          homeGoals: 1,
          awayGoals: 1,
          resultDecision: "PENALTIES",
          advancingTeamId: "team-2",
        }),
      }),
    );
  });

  it("throws an ApiError when storing the result fails", async () => {
    const errorPayload = {
      error: {
        code: "VALIDATION_ERROR",
        message: "game result requires fixed game participants",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 400 }),
      ),
    );

    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      }),
    ).rejects.toMatchObject({
      status: 400,
      payload: errorPayload,
      message: "game result requires fixed game participants",
    });
  });
});