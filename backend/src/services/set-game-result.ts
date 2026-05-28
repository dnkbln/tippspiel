import { GameResultDecision } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";
import { calculateTipPoints } from "./calculate-tip-points.js";

const resultDecisions = new Set<string>(Object.values(GameResultDecision));

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

  const resultDecision = candidate.resultDecision as GameResultDecision;

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      competition: {
        select: {
          scoringRule: {
            select: {
              exactScorePoints: true,
              goalDifferencePoints: true,
              tendencyPoints: true,
            },
          },
        },
      },
      tips: {
        select: {
          id: true,
          homeGoals: true,
          awayGoals: true,
          advancingTeamId: true,
        },
      },
    },
  });

  if (!game) {
    throw new AppError("NOT_FOUND", 404, "game not found");
  }

  if (game.groupId && resultDecision !== "REGULAR_TIME") {
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

  if (resultDecision === "PENALTIES" && !advancingTeamId) {
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
    resultDecision === "PENALTIES" &&
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
    resultDecision !== "PENALTIES" &&
    candidate.homeGoals === candidate.awayGoals
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "knockout draws must be decided by penalties",
    );
  }

  if (resultDecision !== "PENALTIES" && advancingTeamId) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "advancingTeamId is only allowed for penalties",
    );
  }

  if (resultDecision === "PENALTIES" && !advancingTeamId) {
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
      resultDecision,
      advancingTeamId,
      resultEnteredAt: new Date(),
    },
  });

  if (!game.competition.scoringRule) {
    await prisma.tip.updateMany({
      where: {
        gameId,
      },
      data: {
        points: null,
      },
    });

    return;
  }

  await Promise.all(
    game.tips.map((tip) =>
      prisma.tip.update({
        where: {
          id: tip.id,
        },
        data: {
          points: calculateTipPoints({
            scoringRules: game.competition.scoringRule,
            game: {
              isGroupGame: Boolean(game.groupId),
              homeTeamId: game.homeTeamId,
              awayTeamId: game.awayTeamId,
              homeGoals: candidate.homeGoals,
              awayGoals: candidate.awayGoals,
              advancingTeamId,
            },
            tip,
          }),
        },
      }),
    ),
  );
}
