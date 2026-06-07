import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    competition: {
      findUnique: vi.fn(),
    },
    tip: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

import { getCompetitionLeaderboard } from "../../src/services/get-competition-leaderboard.js";

describe("getCompetitionLeaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates scored tip points by user and sorts by total points descending", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({ id: "competition-1" });
    prismaMock.tip.findMany.mockResolvedValue([
      { points: 3, user: { id: "user-1", displayName: "Anna" } },
      { points: 2, user: { id: "user-1", displayName: "Anna" } },
      { points: 7, user: { id: "user-2", displayName: "Ben" } },
      { points: 0, user: { id: "user-3", displayName: "Cara" } },
    ]);

    await expect(getCompetitionLeaderboard("competition-1")).resolves.toEqual([
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
      {
        rank: 3,
        user: { id: "user-3", displayName: "Cara" },
        totalPoints: 0,
      },
    ]);

    expect(prismaMock.tip.findMany).toHaveBeenCalledWith({
      where: {
        game: {
          competitionId: "competition-1",
        },
        points: {
          not: null,
        },
      },
      select: {
        points: true,
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  });

  it("returns an empty leaderboard when no scored tips exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({ id: "competition-1" });
    prismaMock.tip.findMany.mockResolvedValue([]);

    await expect(getCompetitionLeaderboard("competition-1")).resolves.toEqual([]);
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(
      getCompetitionLeaderboard("competition-1"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "competition not found",
    });

    expect(prismaMock.tip.findMany).not.toHaveBeenCalled();
  });
});