import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function submitGroupGameTip(
  userId: string,
  competitionId: string,
  gameId: string,
  input: unknown,
) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError("VALIDATION_ERROR", 400, "tip payload must be an object");
  }

  const candidate = input as Record<string, unknown>;

  if (
    typeof candidate.homeGoals !== "number" ||
    !Number.isInteger(candidate.homeGoals) ||
    candidate.homeGoals < 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "homeGoals must be a non-negative integer",
    );
  }

  if (
    typeof candidate.awayGoals !== "number" ||
    !Number.isInteger(candidate.awayGoals) ||
    candidate.awayGoals < 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "awayGoals must be a non-negative integer",
    );
  }

  if ("advancingTeamId" in candidate) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is not allowed for group game tips",
    );
  }

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      competitionId,
    },
  });

  if (!game) {
    throw new AppError("NOT_FOUND", 404, "game not found");
  }

  if (!game.groupId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "only group games can be tipped with this endpoint",
    );
  }

  if (!game.homeTeamId || !game.awayTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "group game tip requires fixed game participants",
    );
  }

  return prisma.tip.create({
    data: {
      userId,
      gameId,
      homeGoals: candidate.homeGoals,
      awayGoals: candidate.awayGoals,
    },
    select: {
      id: true,
      userId: true,
      gameId: true,
      homeGoals: true,
      awayGoals: true,
    },
  });
}
