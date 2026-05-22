import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/app-error.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    competition: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

import { getCompetitionScoringRules } from "../../src/services/get-competition-scoring-rules.js";

describe("getCompetitionScoringRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stored scoring rules with default suggestions", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      scoringRule: {
        id: "rules-1",
        competitionId: "competition-1",
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    const result = await getCompetitionScoringRules("competition-1");

    expect(result).toEqual({
      scoringRules: {
        id: "rules-1",
        competitionId: "competition-1",
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });
  });

  it("returns null scoring rules when the competition has no stored rules", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
      scoringRule: null,
    });

    const result = await getCompetitionScoringRules("competition-1");

    expect(result).toEqual({
      scoringRules: null,
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(
      getCompetitionScoringRules("competition-1"),
    ).rejects.toEqual(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );
  });
});
