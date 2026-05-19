import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    competition: {
      findUnique: vi.fn(),
    },
    group: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

import { getGroupStandings } from "../../src/services/get-group-standings.js";

describe("getGroupStandings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates standings from completed group games and includes teams without results", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({ id: "competition-1" });

    prismaMock.group.findFirst.mockResolvedValue({
      id: "group-1",
      teams: [
        { id: "team-1", name: "Deutschland", slug: "deutschland" },
        { id: "team-2", name: "Frankreich", slug: "frankreich" },
        { id: "team-3", name: "Spanien", slug: "spanien" },
        { id: "team-4", name: "Italien", slug: "italien" },
      ],
      games: [
        {
          homeTeamId: "team-1",
          awayTeamId: "team-2",
          homeGoals: 2,
          awayGoals: 1,
        },
        {
          homeTeamId: "team-3",
          awayTeamId: "team-1",
          homeGoals: 0,
          awayGoals: 0,
        },
        {
          homeTeamId: "team-2",
          awayTeamId: "team-3",
          homeGoals: 3,
          awayGoals: 0,
        },
      ],
    });

    await expect(
      getGroupStandings("competition-1", "gruppe-a"),
    ).resolves.toEqual([
      {
        rank: 1,
        team: { id: "team-1", name: "Deutschland", slug: "deutschland" },
        played: 2,
        won: 1,
        drawn: 1,
        lost: 0,
        goalsFor: 2,
        goalsAgainst: 1,
        goalDifference: 1,
        points: 4,
      },
      {
        rank: 2,
        team: { id: "team-2", name: "Frankreich", slug: "frankreich" },
        played: 2,
        won: 1,
        drawn: 0,
        lost: 1,
        goalsFor: 4,
        goalsAgainst: 2,
        goalDifference: 2,
        points: 3,
      },
      {
        rank: 3,
        team: { id: "team-3", name: "Spanien", slug: "spanien" },
        played: 2,
        won: 0,
        drawn: 1,
        lost: 1,
        goalsFor: 0,
        goalsAgainst: 3,
        goalDifference: -3,
        points: 1,
      },
      {
        rank: 4,
        team: { id: "team-4", name: "Italien", slug: "italien" },
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]);
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(
      getGroupStandings("competition-1", "gruppe-a"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "competition not found",
    });

    expect(prismaMock.group.findFirst).not.toHaveBeenCalled();
  });

  it("throws when the group does not exist in the competition", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({ id: "competition-1" });
    prismaMock.group.findFirst.mockResolvedValue(null);

    await expect(
      getGroupStandings("competition-1", "gruppe-a"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "group not found",
    });

    expect(prismaMock.group.findFirst).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
        slug: "gruppe-a",
      },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: [{ name: "asc" }, { id: "asc" }],
        },
        games: {
          where: {
            resultEnteredAt: { not: null },
          },
          select: {
            homeTeamId: true,
            awayTeamId: true,
            homeGoals: true,
            awayGoals: true,
          },
        },
      },
    });
  });

});
