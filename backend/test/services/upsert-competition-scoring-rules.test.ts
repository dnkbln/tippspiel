import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/app-error.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    competition: {
      findUnique: vi.fn(),
    },
    competitionScoringRule: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

import { upsertCompetitionScoringRules } from "../../src/services/upsert-competition-scoring-rules.js";

async function expectInvalidScoringField(
  field: "exactScorePoints" | "goalDifferencePoints" | "tendencyPoints",
  value: unknown,
  message: string,
) {
  await expect(
    upsertCompetitionScoringRules("competition-1", {
      exactScorePoints: 3,
      goalDifferencePoints: 2,
      tendencyPoints: 1,
      [field]: value,
    }),
  ).rejects.toEqual(new AppError("VALIDATION_ERROR", 400, message));

  expect(prismaMock.competition.findUnique).not.toHaveBeenCalled();
  expect(prismaMock.competitionScoringRule.upsert).not.toHaveBeenCalled();

  vi.clearAllMocks();
}

describe("upsertCompetitionScoringRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("stores scoring rules for an existing competition", async () => {
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      games: [
        {
          startsAt: new Date("2026-06-14T17:00:00.000Z"),
        },
      ],
    });


    prismaMock.competitionScoringRule.upsert.mockResolvedValue({
      id: "rules-1",
      competitionId: "competition-1",
      exactScorePoints: 3,
      goalDifferencePoints: 2,
      tendencyPoints: 1,
    });

    const result = await upsertCompetitionScoringRules("competition-1", {
      exactScorePoints: 3,
      goalDifferencePoints: 2,
      tendencyPoints: 1,
    });

    expect(result).toEqual({
      id: "rules-1",
      competitionId: "competition-1",
      exactScorePoints: 3,
      goalDifferencePoints: 2,
      tendencyPoints: 1,
    });

    expect(prismaMock.competitionScoringRule.upsert).toHaveBeenCalledWith({
      where: {
        competitionId: "competition-1",
      },
      create: {
        competitionId: "competition-1",
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      update: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      select: {
        id: true,
        competitionId: true,
        exactScorePoints: true,
        goalDifferencePoints: true,
        tendencyPoints: true,
      },
    });
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(
      upsertCompetitionScoringRules("competition-1", {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      }),
    ).rejects.toEqual(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    expect(prismaMock.competitionScoringRule.upsert).not.toHaveBeenCalled();
  });

  it("throws when the payload is not an object", async () => {
    await expect(
      upsertCompetitionScoringRules("competition-1", null),
    ).rejects.toEqual(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "scoring rules payload must be an object",
      ),
    );

    expect(prismaMock.competition.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.competitionScoringRule.upsert).not.toHaveBeenCalled();
  });

  it("throws when exactScorePoints is invalid", async () => {
    const message = "exactScorePoints must be a non-negative integer";

    await expectInvalidScoringField("exactScorePoints", -1, message);
    await expectInvalidScoringField("exactScorePoints", 1.5, message);
    await expectInvalidScoringField("exactScorePoints", "3", message);
  });

  it("throws when goalDifferencePoints is invalid", async () => {
    const message = "goalDifferencePoints must be a non-negative integer";

    await expectInvalidScoringField("goalDifferencePoints", -1, message);
    await expectInvalidScoringField("goalDifferencePoints", 1.5, message);
    await expectInvalidScoringField("goalDifferencePoints", "2", message);
  });

  it("throws when tendencyPoints is invalid", async () => {
    const message = "tendencyPoints must be a non-negative integer";

    await expectInvalidScoringField("tendencyPoints", -1, message);
    await expectInvalidScoringField("tendencyPoints", 1.5, message);
    await expectInvalidScoringField("tendencyPoints", "1", message);
  });

  it("allows zero point values", async () => {
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      games: [
        {
          startsAt: new Date("2026-06-14T17:00:00.000Z"),
        },
      ],
    });

    prismaMock.competitionScoringRule.upsert.mockResolvedValue({
      id: "rules-1",
      competitionId: "competition-1",
      exactScorePoints: 0,
      goalDifferencePoints: 0,
      tendencyPoints: 0,
    });

    const result = await upsertCompetitionScoringRules("competition-1", {
      exactScorePoints: 0,
      goalDifferencePoints: 0,
      tendencyPoints: 0,
    });

    expect(result).toEqual({
      id: "rules-1",
      competitionId: "competition-1",
      exactScorePoints: 0,
      goalDifferencePoints: 0,
      tendencyPoints: 0,
    });
  });

  it("throws when at least one competition game has already started", async () => {
    vi.setSystemTime(new Date("2026-06-14T17:00:00.000Z"));

    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      games: [
        {
          startsAt: new Date("2026-06-14T17:00:00.000Z"),
        },
      ],
    });

    await expect(
      upsertCompetitionScoringRules("competition-1", {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      }),
    ).rejects.toEqual(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "scoring rules can only be changed before first kickoff",
      ),
    );

    expect(prismaMock.competitionScoringRule.upsert).not.toHaveBeenCalled();
  });

});
