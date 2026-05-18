import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

const resultDecisions = new Set([
  "REGULAR_TIME",
  "EXTRA_TIME",
  "PENALTIES",
]);

export async function setGameResult(
  gameId: string,
  input: unknown,
): Promise<void> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "result payload must be an object",
    );
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

  if (
    typeof candidate.resultDecision !== "string" ||
    !resultDecisions.has(candidate.resultDecision)
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "resultDecision is required",
    );
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });

  if (!game) {
    throw new AppError("NOT_FOUND", 404, "game not found");
  }

  if (game.groupId && candidate.resultDecision !== "REGULAR_TIME") {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "group games must use REGULAR_TIME",
    );
  }

  const advancingTeamId =
    typeof candidate.advancingTeamId === "string"
      ? candidate.advancingTeamId.trim()
      : null;

  if (candidate.resultDecision === "PENALTIES" && !advancingTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is required for penalties",
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
    candidate.resultDecision === "PENALTIES" &&
    candidate.homeGoals !== candidate.awayGoals
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "penalties require a draw after extra time",
    );
  }

  if (
    !game.groupId &&
    candidate.resultDecision !== "PENALTIES" &&
    candidate.homeGoals === candidate.awayGoals
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "knockout draws must be decided by penalties",
    );
  }

  if (candidate.resultDecision !== "PENALTIES" && advancingTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is only allowed for penalties",
    );
  }

  if (candidate.resultDecision === "PENALTIES" && !advancingTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is required for penalties",
    );
  }

  if (!game.homeTeamId || !game.awayTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "game result requires fixed game participants",
    );
  }

  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      homeGoals: candidate.homeGoals,
      awayGoals: candidate.awayGoals,
      resultDecision: candidate.resultDecision,
      advancingTeamId,
      resultEnteredAt: new Date(),
    },
  });
}
