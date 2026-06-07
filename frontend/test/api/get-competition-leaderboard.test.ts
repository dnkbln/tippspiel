import { afterEach, describe, expect, it, vi } from "vitest";

import { getCompetitionLeaderboard } from "../../src/api/get-competition-leaderboard";

describe("getCompetitionLeaderboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the leaderboard for a competition from the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            leaderboard: [
              {
                rank: 1,
                user: {
                  id: "user-1",
                  displayName: "Anna",
                },
                totalPoints: 12,
              },
              {
                rank: 2,
                user: {
                  id: "user-2",
                  displayName: "Ben",
                },
                totalPoints: 7,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getCompetitionLeaderboard("competition-1")).resolves.toEqual({
      leaderboard: [
        {
          rank: 1,
          user: {
            id: "user-1",
            displayName: "Anna",
          },
          totalPoints: 12,
        },
        {
          rank: 2,
          user: {
            id: "user-2",
            displayName: "Ben",
          },
          totalPoints: 7,
        },
      ],
    });

    expect(fetch).toHaveBeenCalledWith(
      "/competitions/competition-1/leaderboard",
      {
        method: "GET",
      },
    );
  });

  it("throws an ApiError when loading the leaderboard fails", async () => {
    const errorPayload = {
      error: { code: "UNAUTHORIZED", message: "authentication required" },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 401 }),
      ),
    );

    await expect(getCompetitionLeaderboard("competition-1")).rejects.toMatchObject({
      status: 401,
      payload: errorPayload,
      message: "authentication required",
    });
  });
});