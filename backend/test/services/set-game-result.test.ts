import { beforeEach, describe, expect, it, vi } from "vitest";
import { setGameResult } from "../../src/services/set-game-result.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    game: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

describe("setGameResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a regular-time result for a group game", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-14T20:00:00.000Z"));

    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: "group-1",
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    prismaMock.game.update.mockResolvedValue({});

    await expect(
      setGameResult("game-1", {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.game.update).toHaveBeenCalledWith({
      where: { id: "game-1" },
      data: {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
        advancingTeamId: null,
        resultEnteredAt: new Date("2026-06-14T20:00:00.000Z"),
      },
    });

    vi.useRealTimers();
  });

  it("stores a penalties result for a knockout game with an advancing team", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T20:00:00.000Z"));

    try {
      prismaMock.game.findUnique.mockResolvedValue({
        id: "game-1",
        groupId: null,
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      });

      prismaMock.game.update.mockResolvedValue({});

      await expect(
        setGameResult("game-1", {
          homeGoals: 1,
          awayGoals: 1,
          resultDecision: "PENALTIES",
          advancingTeamId: "team-2",
        }),
      ).resolves.toBeUndefined();

      expect(prismaMock.game.update).toHaveBeenCalledWith({
        where: { id: "game-1" },
        data: {
          homeGoals: 1,
          awayGoals: 1,
          resultDecision: "PENALTIES",
          advancingTeamId: "team-2",
          resultEnteredAt: new Date("2026-06-28T20:00:00.000Z"),
        },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws when the advancing team is not part of the game", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 1,
        resultDecision: "PENALTIES",
        advancingTeamId: "team-3",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "advancingTeamId must reference one of the game teams",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when penalties are used for a non-draw knockout result", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      setGameResult("game-1", {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "PENALTIES",
        advancingTeamId: "team-1",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "penalties require a draw after extra time",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when a knockout result is a draw without penalties", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 1,
        resultDecision: "EXTRA_TIME",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "knockout draws must be decided by penalties",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when an advancing team is provided without penalties", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      setGameResult("game-1", {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "EXTRA_TIME",
        advancingTeamId: "team-1",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "advancingTeamId is only allowed for penalties",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when penalties are missing the advancing team", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 1,
        resultDecision: "PENALTIES",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "advancingTeamId is required for penalties",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when input is missing", async () => {
    await expect(setGameResult("game-1", undefined)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "result payload must be an object",
    });

    expect(prismaMock.game.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when homeGoals is invalid", async () => {
    await expect(
      setGameResult("game-1", {
        homeGoals: -1,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "homeGoals must be a non-negative integer",
    });

    expect(prismaMock.game.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when awayGoals is invalid", async () => {
    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 1.5,
        resultDecision: "REGULAR_TIME",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "awayGoals must be a non-negative integer",
    });

    expect(prismaMock.game.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when resultDecision is invalid", async () => {
    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 0,
        resultDecision: "AFTER_GOLDEN_GOAL",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "resultDecision is required",
    });

    expect(prismaMock.game.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when the game does not exist", async () => {
    prismaMock.game.findUnique.mockResolvedValue(null);

    await expect(
      setGameResult("game-1", {
        homeGoals: 1,
        awayGoals: 0,
        resultDecision: "REGULAR_TIME",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "game not found",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

  it("throws when the game participants are not fixed yet", async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: "game-1",
      groupId: null,
      homeTeamId: null,
      awayTeamId: "team-2",
    });

    await expect(
      setGameResult("game-1", {
        homeGoals: 2,
        awayGoals: 1,
        resultDecision: "REGULAR_TIME",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "game result requires fixed game participants",
    });

    expect(prismaMock.game.update).not.toHaveBeenCalled();
  });

});
