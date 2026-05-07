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

describe("importTournamentSchedule", () => {

  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
    prismaMock.competition.create.mockResolvedValue({
      id: "competition-1",
      name: "Fussball-WM 2026",
      slug: "fussball-wm-2026",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.team.createMany.mockResolvedValue({ count: 0 });
    prismaMock.round.createMany.mockResolvedValue({ count: 0 });
    prismaMock.team.findMany.mockResolvedValue([]);
    prismaMock.round.findMany.mockResolvedValue([]);
    prismaMock.game.createMany.mockResolvedValue({ count: 0 });
  });

  it("throws when competition is missing", async () => {
    await expect(
      importTournamentSchedule({
        teams: [],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "competition is required",
    });
  });

  it("throws when competition.name is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {},
        teams: [],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "competition.name is required",
    });
  });

  it("throws when competition.slug is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
        },
        teams: [],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "competition.slug is required",
    });
  });

  it("throws when teams is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "teams is required",
    });
  });

  it("throws when rounds is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds is required",
    });
  });

  it("throws when games is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games is required",
    });
  });

  it("throws when a team entry is not an object", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: ["Deutschland"],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "teams[0] must be an object",
    });
  });

  it("throws when teams[0].name is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {},
        ],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "teams[0].name is required",
    });
  });

  it("throws when teams[0].slug is missing", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [
          {
            name: "Deutschland",
          },
        ],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "teams[0].slug is required",
    });
  });

  it("throws when a round entry is not an object", async () => {
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
        rounds: ["Gruppenphase"],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds[0] must be an object",
    });
  });

  it("throws when rounds[0].name is missing", async () => {
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
            slug: "gruppenphase",
            order: 1,
          },
        ],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds[0].name is required",
    });
  });

  it("throws when rounds[0].slug is missing", async () => {
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
            order: 1,
          },
        ],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds[0].slug is required",
    });
  });

  it("throws when rounds[0].order is missing", async () => {
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
          },
        ],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds[0].order is required",
    });
  });

  it("throws when a game entry is not an object", async () => {
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
        games: ["Deutschland gegen Frankreich"],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0] must be an object",
    });
  });

  it("throws when games[0].roundSlug is missing", async () => {
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
            homeTeamSlug: "deutschland",
            awayTeamSlug: "frankreich",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].roundSlug is required",
    });
  });

  it("throws when games[0].homeTeamSlug is missing", async () => {
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
            awayTeamSlug: "frankreich",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].homeTeamSlug is required",
    });
  });

  it("throws when games[0].awayTeamSlug is missing", async () => {
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
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].awayTeamSlug is required",
    });
  });

  it("throws when games[0].startsAt is missing", async () => {
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
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].startsAt is required",
    });
  });

  it("throws when games[0].startsAt is not a valid datetime", async () => {
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
            startsAt: "kein-datum",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].startsAt must be a valid datetime",
    });
  });

  it("throws when games[0].roundSlug does not reference an existing round", async () => {
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
            roundSlug: "halbfinale",
            homeTeamSlug: "deutschland",
            awayTeamSlug: "frankreich",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].roundSlug must reference an existing round",
    });
  });

  it("throws when games[0].homeTeamSlug does not reference an existing team", async () => {
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
            homeTeamSlug: "spanien",
            awayTeamSlug: "frankreich",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].homeTeamSlug must reference an existing team",
    });
  });

  it("throws when games[0].awayTeamSlug does not reference an existing team", async () => {
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
            awayTeamSlug: "spanien",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0].awayTeamSlug must reference an existing team",
    });
  });

  it("throws when games[0] uses the same team for home and away", async () => {
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
        games: [
          {
            roundSlug: "gruppenphase",
            homeTeamSlug: "deutschland",
            awayTeamSlug: "deutschland",
            startsAt: "2026-06-14T19:00:00+02:00",
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "games[0] must reference two different teams",
    });
  });

  it("throws when rounds[0].order is not an integer", async () => {
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
            order: 1.5,
          },
        ],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds[0].order must be an integer",
    });
  });

  it("throws when team slugs are duplicated", async () => {
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
            name: "Deutschland II",
            slug: "deutschland",
          },
        ],
        rounds: [],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: 'teams[1].slug duplicates "deutschland"',
    });
  });

  it("throws when round slugs are duplicated", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [
          {
            name: "Gruppenphase A",
            slug: "gruppenphase",
            order: 1,
          },
          {
            name: "Gruppenphase B",
            slug: "gruppenphase",
            order: 2,
          },
        ],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: 'rounds[1].slug duplicates "gruppenphase"',
    });
  });

  it("throws when round orders are duplicated", async () => {
    await expect(
      importTournamentSchedule({
        competition: {
          name: "Fussball-WM 2026",
          slug: "fussball-wm-2026",
        },
        teams: [],
        rounds: [
          {
            name: "Gruppenphase",
            slug: "gruppenphase",
            order: 1,
          },
          {
            name: "Achtelfinale",
            slug: "achtelfinale",
            order: 1,
          },
        ],
        games: [],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "rounds[1].order duplicates 1",
    });
  });

  it("accepts a valid tournament schedule payload", async () => {
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
  });

});
