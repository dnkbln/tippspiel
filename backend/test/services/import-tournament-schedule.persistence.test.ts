import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      $transaction: vi.fn(),
      competition: {
        create: vi.fn(),
      },
      team: {
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
      round: {
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
      game: {
        createMany: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { importTournamentSchedule } from "../../src/services/import-tournament-schedule.js";

describe("importTournamentSchedule persistence", () => {

  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
    prismaMock.team.createMany.mockResolvedValue({ count: 0 });
    prismaMock.round.createMany.mockResolvedValue({ count: 0 });
    prismaMock.team.findMany.mockResolvedValue([]);
    prismaMock.round.findMany.mockResolvedValue([]);
    prismaMock.game.createMany.mockResolvedValue({ count: 0 });
  });

  it("creates the competition for a valid payload", async () => {
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {
            name: "Deutschland",
            slug: "deutschland",
          },
        ],
        rounds: [
          {
            name: "Gruppenphase",
            slug: "gruppenphase",
            order: 1,
          },
        ],
        games: [],
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.competition.create).toHaveBeenCalledWith({
      data: {
        name: "Fussball-WM 2026",
        slug: "fussball-wm-2026",
      },
    });
  });

  it("creates teams for a valid payload", async () => {
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.team.createMany.mockResolvedValue({
      count: 2,
    });

    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {
            name: "Deutschland",
            slug: "deutschland",
          },
          {
            name: "Frankreich",
            slug: "frankreich",
          },
        ],
        rounds: [],
        games: [],
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.team.createMany).toHaveBeenCalledWith({
      data: [
        {
          competitionId: "competition-1",
          name: "Deutschland",
          slug: "deutschland",
        },
        {
          competitionId: "competition-1",
          name: "Frankreich",
          slug: "frankreich",
        },
      ],
    });
  });

  it("creates rounds for a valid payload", async () => {
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.team.createMany.mockResolvedValue({
      count: 2,
    });

    prismaMock.round.createMany.mockResolvedValue({
      count: 2,
    });

    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {
            name: "Deutschland",
            slug: "deutschland",
          },
          {
            name: "Frankreich",
            slug: "frankreich",
          },
        ],
        rounds: [
          {
            name: "Gruppenphase",
            slug: "gruppenphase",
            order: 1,
          },
          {
            name: "Achtelfinale",
            slug: "achtelfinale",
            order: 2,
          },
        ],
        games: [],
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.round.createMany).toHaveBeenCalledWith({
      data: [
        {
          competitionId: "competition-1",
          name: "Gruppenphase",
          slug: "gruppenphase",
          order: 1,
        },
        {
          competitionId: "competition-1",
          name: "Achtelfinale",
          slug: "achtelfinale",
          order: 2,
        },
      ],
    });
  });

  it("loads persisted teams and rounds for game mapping", async () => {
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.team.createMany.mockResolvedValue({ count: 2 });
    prismaMock.round.createMany.mockResolvedValue({ count: 1 });

    prismaMock.team.findMany.mockResolvedValue([
      {
        id: "team-1",
        competitionId: "competition-1",
        name: "Deutschland",
        slug: "deutschland",
      },
      {
        id: "team-2",
        competitionId: "competition-1",
        name: "Frankreich",
        slug: "frankreich",
      },
    ]);

    prismaMock.round.findMany.mockResolvedValue([
      {
        id: "round-1",
        competitionId: "competition-1",
        name: "Gruppenphase",
        slug: "gruppenphase",
        order: 1,
      },
    ]);

    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {
            name: "Deutschland",
            slug: "deutschland",
          },
          {
            name: "Frankreich",
            slug: "frankreich",
          },
        ],
        rounds: [
          {
            name: "Gruppenphase",
            slug: "gruppenphase",
            order: 1,
          },
        ],
        games: [
          {
            roundSlug: "gruppenphase",
            homeTeamSlug: "deutschland",
            awayTeamSlug: "frankreich",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.team.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
      },
    });

    expect(prismaMock.round.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
      },
    });
  });

  it("creates games for a valid payload", async () => {
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.team.createMany.mockResolvedValue({ count: 2 });
    prismaMock.round.createMany.mockResolvedValue({ count: 1 });

    prismaMock.team.findMany.mockResolvedValue([
      {
        id: "team-1",
        competitionId: "competition-1",
        name: "Deutschland",
        slug: "deutschland",
      },
      {
        id: "team-2",
        competitionId: "competition-1",
        name: "Frankreich",
        slug: "frankreich",
      },
    ]);

    prismaMock.round.findMany.mockResolvedValue([
      {
        id: "round-1",
        competitionId: "competition-1",
        name: "Gruppenphase",
        slug: "gruppenphase",
        order: 1,
      },
    ]);

    prismaMock.game.createMany.mockResolvedValue({ count: 1 });

    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {
            name: "Deutschland",
            slug: "deutschland",
          },
          {
            name: "Frankreich",
            slug: "frankreich",
          },
        ],
        rounds: [
          {
            name: "Gruppenphase",
            slug: "gruppenphase",
            order: 1,
          },
        ],
        games: [
          {
            roundSlug: "gruppenphase",
            homeTeamSlug: "deutschland",
            awayTeamSlug: "frankreich",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.game.createMany).toHaveBeenCalledWith({
      data: [
        {
          competitionId: "competition-1",
          roundId: "round-1",
          homeTeamId: "team-1",
          awayTeamId: "team-2",
          startsAt: new Date("2026-06-14T19:00:00+02:00"),
        },
      ],
    });
  });

  it("runs the import inside a transaction", async () => {
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [],
        games: [],
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

});
