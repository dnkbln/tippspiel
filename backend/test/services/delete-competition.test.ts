import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/app-error.js";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      competition: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      game: {
        deleteMany: vi.fn(),
      },
      round: {
        deleteMany: vi.fn(),
      },
      team: {
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { deleteCompetition } from "../../src/services/delete-competition.js";

describe("deleteCompetition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("deletes games, rounds, teams and the competition before first kickoff", async () => {
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));

    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      games: [
        {
          startsAt: new Date("2026-06-14T17:00:00.000Z"),
        },
      ],
    });

    prismaMock.game.deleteMany.mockReturnValue("delete-games");
    prismaMock.round.deleteMany.mockReturnValue("delete-rounds");
    prismaMock.team.deleteMany.mockReturnValue("delete-teams");
    prismaMock.competition.delete.mockReturnValue("delete-competition");
    prismaMock.$transaction.mockResolvedValue([]);

    await deleteCompetition("competition-1");

    expect(prismaMock.competition.findUnique).toHaveBeenCalledWith({
      where: {
        id: "competition-1",
      },
      select: {
        id: true,
        games: {
          select: {
            startsAt: true,
          },
        },
      },
    });

    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      "delete-games",
      "delete-rounds",
      "delete-teams",
      "delete-competition",
    ]);
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(deleteCompetition("competition-1")).rejects.toEqual(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("throws when at least one game has already started", async () => {
    vi.setSystemTime(new Date("2026-06-14T17:00:00.000Z"));

    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      games: [
        {
          startsAt: new Date("2026-06-14T17:00:00.000Z"),
        },
      ],
    });

    await expect(deleteCompetition("competition-1")).rejects.toEqual(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "competition can only be deleted before first kickoff",
      ),
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
