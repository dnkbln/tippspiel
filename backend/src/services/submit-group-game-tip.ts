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

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      competitionId,
    },
  });

  if (!game) {
    throw new AppError("NOT_FOUND", 404, "game not found");
  }

  if (game.startsAt <= new Date()) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "tip deadline has passed",
    );
  }

  if (!game.homeTeamId || !game.awayTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "tip requires fixed game participants",
    );
  }

  const advancingTeamId =
    typeof candidate.advancingTeamId === "string"
      ? candidate.advancingTeamId.trim()
      : null;

  if (game.groupId && "advancingTeamId" in candidate) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is not allowed for group game tips",
    );
  }

  if (
    !game.groupId &&
    candidate.homeGoals === candidate.awayGoals &&
    !advancingTeamId
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "knockout draw tips require advancingTeamId",
    );
  }

  if (
    advancingTeamId &&
    advancingTeamId !== game.homeTeamId &&
    advancingTeamId !== game.awayTeamId
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId must reference one of the game teams",
    );
  }

  if (
    !game.groupId &&
    candidate.homeGoals !== candidate.awayGoals &&
    advancingTeamId
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is only allowed for knockout draw tips",
    );
  }

  return prisma.tip.upsert({
    where: {
      userId_gameId: {
        userId,
        gameId,
      },
    },
    create: {
      userId,
      gameId,
      homeGoals: candidate.homeGoals,
      awayGoals: candidate.awayGoals,
      advancingTeamId,
    },
    update: {
      homeGoals: candidate.homeGoals,
      awayGoals: candidate.awayGoals,
      advancingTeamId,
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

}
