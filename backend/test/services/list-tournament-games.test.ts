import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      game: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { listTournamentGames } from "../../src/services/list-tournament-games.js";

describe("listTournamentGames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns imported games ordered by kickoff time", async () => {
    prismaMock.game.findMany.mockResolvedValue([
      {
        id: "game-early",
        startsAt: new Date("2026-06-14T17:00:00.000Z"),
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
      },
      {
        id: "game-late",
        startsAt: new Date("2026-06-14T20:00:00.000Z"),
        round: {
          id: "round-1",
          name: "Gruppenphase",
          slug: "gruppenphase",
          order: 1,
        },
        homeTeam: {
          id: "team-3",
          name: "Spanien",
          slug: "spanien",
        },
        awayTeam: {
          id: "team-4",
          name: "Italien",
          slug: "italien",
        },
      },
    ]);

    const result = await listTournamentGames("competition-1");

    expect(result).toEqual([
            {
        id: "game-early",
        startsAt: new Date("2026-06-14T17:00:00.000Z"),
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
      },
      {
        id: "game-late",
        startsAt: new Date("2026-06-14T20:00:00.000Z"),
        round: {
          id: "round-1",
          name: "Gruppenphase",
          slug: "gruppenphase",
          order: 1,
        },
        homeTeam: {
          id: "team-3",
          name: "Spanien",
          slug: "spanien",
        },
        awayTeam: {
          id: "team-4",
          name: "Italien",
          slug: "italien",
        },
      },
    ]);

    expect(prismaMock.game.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
      },
      include: {
        round: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        startsAt: "asc",
      },
    });
  });
});
