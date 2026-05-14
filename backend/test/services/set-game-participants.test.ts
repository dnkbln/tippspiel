import { beforeEach, describe, expect, it, vi } from "vitest";
import { setGameParticipants } from "../../src/services/set-game-participants.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    game: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    team: {
      count: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

describe("setGameParticipants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when input is missing", async () => {
    await expect(setGameParticipants("game-1", undefined)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "participant payload must be an object",
    });
  });

  it("throws when homeTeamId is missing", async () => {
    await expect(
      setGameParticipants("game-1", {
        awayTeamId: "team-2",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "homeTeamId is required",
    });
  });

  it("throws when awayTeamId is missing", async () => {
    await expect(
      setGameParticipants("game-1", {
        homeTeamId: "team-1",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "awayTeamId is required",
    });
  });

  it("accepts two team ids", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      startsAt: new Date("2026-06-28T16:59:59.000Z"),
      homeTeamPlaceholder: "Sieger Gruppe A",
      awayTeamPlaceholder: "Zweiter Gruppe B",
    });
    prismaMock.team.count.mockResolvedValue(2);
    prismaMock.game.update.mockResolvedValue({});

    await expect(
      setGameParticipants("game-1", {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.game.findUnique).toHaveBeenCalledWith({
      where: {
        id: "game-1",
      },
    });

    expect(prismaMock.team.count).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
        id: {
          in: ["team-1", "team-2"],
        },
      },
    });

    expect(prismaMock.game.update).toHaveBeenCalledWith({
      where: {
        id: "game-1",
      },
      data: {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        homeTeamPlaceholder: null,
        awayTeamPlaceholder: null,
      },
    });

  });

  it("throws when the game does not exist", async () => {
    prismaMock.game.findUnique.mockResolvedValue(null);

    await expect(
      setGameParticipants("game-1", {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "game not found",
    });

    expect(prismaMock.game.findUnique).toHaveBeenCalledWith({
      where: {
        id: "game-1",
      },
    });

    expect(prismaMock.team.count).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();

  });

  it("throws when home and away team are the same", async () => {
    await expect(
      setGameParticipants("game-1", {
        homeTeamId: "team-1",
        awayTeamId: "team-1",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "homeTeamId and awayTeamId must reference different teams",
    });

    expect(prismaMock.game.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.team.count).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();

  });

  it("throws when a team does not belong to the game competition", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      startsAt: new Date("2026-06-28T16:59:59.000Z"),
      homeTeamPlaceholder: "Sieger Gruppe A",
      awayTeamPlaceholder: "Zweiter Gruppe B",
    });
    prismaMock.team.count.mockResolvedValue(1);

    await expect(
      setGameParticipants("game-1", {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "teams must belong to the game competition",
    });

    expect(prismaMock.team.count).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
        id: {
          in: ["team-1", "team-2"],
        },
      },
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when the game has already started", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-06-28T17:00:00.000Z"));

      prismaMock.game.findUnique.mockResolvedValue({
        id: "game-1",
        competitionId: "competition-1",
        startsAt: new Date("2026-06-28T16:59:59.000Z"),
        homeTeamPlaceholder: "Sieger Gruppe A",
        awayTeamPlaceholder: "Zweiter Gruppe B",
      });

      await expect(
        setGameParticipants("game-1", {
          homeTeamId: "team-1",
          awayTeamId: "team-2",
        }),
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400,
        message: "game participants can only be changed before kickoff",
      });

      expect(prismaMock.team.count).not.toHaveBeenCalled();
      expect(prismaMock.game.update).not.toHaveBeenCalled();

    } finally {
      vi.useRealTimers();
    }
  });

  it("throws when the game has no placeholders", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      startsAt: new Date("2026-06-28T17:00:00.000Z"),
      homeTeamPlaceholder: null,
      awayTeamPlaceholder: null,
    });

    await expect(
      setGameParticipants("game-1", {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "game participants can only replace placeholders",
    });

    expect(prismaMock.team.count).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

});
