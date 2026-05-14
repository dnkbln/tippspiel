import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function setGameParticipants(
  gameId: string,
  input: unknown,
): Promise<void> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "participant payload must be an object",
    );
  }

  const candidate = input as Record<string, unknown>;

  if (typeof candidate.homeTeamId !== "string" || !candidate.homeTeamId.trim()) {
    throw new AppError("VALIDATION_ERROR", 400, "homeTeamId is required");
  }

  if (typeof candidate.awayTeamId !== "string" || !candidate.awayTeamId.trim()) {
    throw new AppError("VALIDATION_ERROR", 400, "awayTeamId is required");
  }

  const homeTeamId = candidate.homeTeamId.trim();
  const awayTeamId = candidate.awayTeamId.trim();

  if (homeTeamId === awayTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "homeTeamId and awayTeamId must reference different teams",
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

  if (game.startsAt <= new Date()) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "game participants can only be changed before kickoff",
    );
  }

  if (!game.homeTeamPlaceholder && !game.awayTeamPlaceholder) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "game participants can only replace placeholders",
    );
  }

  const matchingTeamCount = await prisma.team.count({
    where: {
      competitionId: game.competitionId,
      id: {
        in: [homeTeamId, awayTeamId],
      },
    },
  });

  if (matchingTeamCount !== 2) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "teams must belong to the game competition",
    );
  }

  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      homeTeamId,
      awayTeamId,
      homeTeamPlaceholder: null,
      awayTeamPlaceholder: null,
    },
  });
}

