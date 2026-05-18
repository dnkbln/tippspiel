import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/app-error.js";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      competition: {
        findUnique: vi.fn(),
      },
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

  it("returns imported games ordered by round, group, groupRound and kickoff time", async () => {

    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
    });

    prismaMock.game.findMany.mockResolvedValue([
      {
        id: "game-early",
        startsAt: new Date("2026-06-14T17:00:00.000Z"),
        group: {
          id: "group-1",
          name: "Gruppe A",
          slug: "gruppe-a",
          order: 1,
        },
        groupRound: 1,
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
        group: {
          id: "group-1",
          name: "Gruppe A",
          slug: "gruppe-a",
          order: 1,
        },
        groupRound: 1,
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
        groupRound: 1,
        group: {
          id: "group-1",
          name: "Gruppe A",
          slug: "gruppe-a",
          order: 1,
        },
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
        groupRound: 1,
        group: {
          id: "group-1",
          name: "Gruppe A",
          slug: "gruppe-a",
          order: 1,
        },
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
        group: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [
        { round: { order: "asc" } },
        { group: { order: "asc" } },
        { groupRound: "asc" },
        { startsAt: "asc" },
      ],
    });
  });

  it("returns games with placeholders when teams are not fixed yet", async () => {

    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
    });

    prismaMock.game.findMany.mockResolvedValue([
      {
        id: "game-1",
        startsAt: new Date("2026-06-28T17:00:00.000Z"),
        groupRound: null,
        group: null,
        homeTeam: null,
        awayTeam: null,
        homeTeamPlaceholder: "Sieger Gruppe A",
        awayTeamPlaceholder: "Zweiter Gruppe B",
        round: {
          id: "round-1",
          name: "Achtelfinale",
          slug: "achtelfinale",
          order: 2,
        },
      },
    ]);

    const result = await listTournamentGames("competition-1");

    expect(result).toEqual([
      {
        id: "game-1",
        startsAt: new Date("2026-06-28T17:00:00.000Z"),
        groupRound: null,
        group: null,
        homeTeam: null,
        awayTeam: null,
        homeTeamPlaceholder: "Sieger Gruppe A",
        awayTeamPlaceholder: "Zweiter Gruppe B",
        round: {
          id: "round-1",
          name: "Achtelfinale",
          slug: "achtelfinale",
          order: 2,
        },
      },
    ]);

    expect(prismaMock.game.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
      },
      include: {
        round: true,
        group: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [
        { round: { order: "asc" } },
        { group: { order: "asc" } },
        { groupRound: "asc" },
        { startsAt: "asc" },
      ],
    });
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(listTournamentGames("competition-1")).rejects.toEqual(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    expect(prismaMock.game.findMany).not.toHaveBeenCalled();
  });

});
