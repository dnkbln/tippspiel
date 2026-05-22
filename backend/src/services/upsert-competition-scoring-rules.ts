import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function upsertCompetitionScoringRules(
  competitionId: string,
  input: unknown,
) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "scoring rules payload must be an object",
    );
  }

  const candidate = input as Record<string, unknown>;

  const exactScorePoints = candidate.exactScorePoints;
  const goalDifferencePoints = candidate.goalDifferencePoints;
  const tendencyPoints = candidate.tendencyPoints;

  if (
    typeof exactScorePoints !== "number" ||
    !Number.isInteger(exactScorePoints) ||
    exactScorePoints < 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "exactScorePoints must be a non-negative integer",
    );
  }

  if (
    typeof goalDifferencePoints !== "number" ||
    !Number.isInteger(goalDifferencePoints) ||
    goalDifferencePoints < 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "goalDifferencePoints must be a non-negative integer",
    );
  }

  if (
    typeof tendencyPoints !== "number" ||
    !Number.isInteger(tendencyPoints) ||
    tendencyPoints < 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "tendencyPoints must be a non-negative integer",
    );
  }

  const competition = await prisma.competition.findUnique({
    where: {
      id: competitionId,
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

  if (!competition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  const now = new Date();
  const hasStartedGame = competition.games.some((game) => game.startsAt <= now);

  if (hasStartedGame) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "scoring rules can only be changed before first kickoff",
    );
  }

  return prisma.competitionScoringRule.upsert({
    where: {
      competitionId,
    },
    create: {
      competitionId,
      exactScorePoints,
      goalDifferencePoints,
      tendencyPoints,
    },
    update: {
      exactScorePoints,
      goalDifferencePoints,
      tendencyPoints,
    },
    select: {
      id: true,
      competitionId: true,
      exactScorePoints: true,
      goalDifferencePoints: true,
      tendencyPoints: true,
    },
  });
}
