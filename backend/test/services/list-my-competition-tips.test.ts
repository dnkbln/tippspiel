import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      tip: {
        findMany: vi.fn(),
      },
      competition: {
        findUnique: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { listMyCompetitionTips } from "../../src/services/list-my-competition-tips.js";
import { AppError } from "../../src/errors/app-error.js";

describe("listMyCompetitionTips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the authenticated user's tips for the competition", async () => {

    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
    });

    prismaMock.tip.findMany.mockResolvedValue([
      {
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
        points: 3,
      },
      {
        gameId: "game-2",
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
        points: null,
      },
    ]);

    const result = await listMyCompetitionTips("user-1", "competition-1");

    expect(result).toEqual([
      {
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
        points: 3,
      },
      {
        gameId: "game-2",
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
        points: null,
      },
    ]);

    expect(prismaMock.tip.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        game: {
          competitionId: "competition-1",
        },
      },
      select: {
        gameId: true,
        homeGoals: true,
        awayGoals: true,
        advancingTeamId: true,
        points: true,
      },
      orderBy: {
        game: {
          startsAt: "asc",
        },
      },
    });
  });

  it("returns an empty list when the user has no tips for the competition", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
    });

    prismaMock.tip.findMany.mockResolvedValue([]);

    const result = await listMyCompetitionTips("user-1", "competition-1");

    expect(result).toEqual([]);
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(
      listMyCompetitionTips("user-1", "competition-1"),
    ).rejects.toEqual(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    expect(prismaMock.tip.findMany).not.toHaveBeenCalled();
  });
});