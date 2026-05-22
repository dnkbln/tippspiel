import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    game: {
      findFirst: vi.fn(),
    },
    tip: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

import { submitGroupGameTip } from "../../src/services/submit-group-game-tip.js";

describe("submitGroupGameTip", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("stores a group game tip for the authenticated user and game", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: "group-1",
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    prismaMock.tip.create.mockResolvedValue({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 2,
      awayGoals: 1,
      advancingTeamId: null,
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
      }),
    ).resolves.toEqual({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 2,
      awayGoals: 1,
      advancingTeamId: null,
    });

    expect(prismaMock.game.findFirst).toHaveBeenCalledWith({
      where: {
        id: "game-1",
        competitionId: "competition-1",
      },
    });

    expect(prismaMock.tip.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
      },
      select: {
        id: true,
        userId: true,
        gameId: true,
        homeGoals: true,
        awayGoals: true,
        advancingTeamId: true,
      },
    });
  });

  it("rejects advancingTeamId for group game tips", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: "group-1",
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: "team-1",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "advancingTeamId is not allowed for group game tips",
    });

    expect(prismaMock.game.findFirst).toHaveBeenCalledWith({
      where: {
        id: "game-1",
        competitionId: "competition-1",
      },
    });
    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("rejects games without fixed participants", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: "group-1",
      homeTeamId: null,
      awayTeamId: "team-2",
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "tip requires fixed game participants",
    });

    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("returns not found when the game does not exist in the competition", async () => {
    prismaMock.game.findFirst.mockResolvedValue(null);

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "game not found",
    });

    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("rejects missing input", async () => {
    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", undefined),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "tip payload must be an object",
    });

    expect(prismaMock.game.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("rejects invalid homeGoals", async () => {
    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: -1,
        awayGoals: 1,
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "homeGoals must be a non-negative integer",
    });

    expect(prismaMock.game.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("rejects invalid awayGoals", async () => {
    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 1,
        awayGoals: 1.5,
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "awayGoals must be a non-negative integer",
    });

    expect(prismaMock.game.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("stores a knockout game tip with a decisive result without advancingTeamId", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    prismaMock.tip.create.mockResolvedValue({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 2,
      awayGoals: 1,
      advancingTeamId: null,
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
      }),
    ).resolves.toEqual({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 2,
      awayGoals: 1,
      advancingTeamId: null,
    });

    expect(prismaMock.tip.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        gameId: "game-1",
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: null,
      },
      select: {
        id: true,
        userId: true,
        gameId: true,
        homeGoals: true,
        awayGoals: true,
        advancingTeamId: true,
      },
    });
  });

  it("stores a knockout draw tip with advancingTeamId", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    prismaMock.tip.create.mockResolvedValue({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 1,
      awayGoals: 1,
      advancingTeamId: "team-2",
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
      }),
    ).resolves.toEqual({
      id: "tip-1",
      userId: "user-1",
      gameId: "game-1",
      homeGoals: 1,
      awayGoals: 1,
      advancingTeamId: "team-2",
    });

    expect(prismaMock.tip.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        gameId: "game-1",
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-2",
      },
      select: {
        id: true,
        userId: true,
        gameId: true,
        homeGoals: true,
        awayGoals: true,
        advancingTeamId: true,
      },
    });
  });

  it("rejects advancingTeamId that is not part of the knockout game", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 1,
        awayGoals: 1,
        advancingTeamId: "team-3",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "advancingTeamId must reference one of the game teams",
    });

    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

  it("rejects advancingTeamId for decisive knockout tips", async () => {
    prismaMock.game.findFirst.mockResolvedValue({
      id: "game-1",
      competitionId: "competition-1",
      groupId: null,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    });

    await expect(
      submitGroupGameTip("user-1", "competition-1", "game-1", {
        homeGoals: 2,
        awayGoals: 1,
        advancingTeamId: "team-1",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "advancingTeamId is only allowed for knockout draw tips",
    });

    expect(prismaMock.tip.create).not.toHaveBeenCalled();
  });

});
