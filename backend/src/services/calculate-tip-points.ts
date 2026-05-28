export type ScoringRules = {
  exactScorePoints: number;
  goalDifferencePoints: number;
  tendencyPoints: number;
};

export type ScoredGame = {
  isGroupGame: boolean;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  advancingTeamId: string | null;
};

export type ScoredTip = {
  homeGoals: number;
  awayGoals: number;
  advancingTeamId: string | null;
};

type CalculateTipPointsInput = {
  scoringRules: ScoringRules;
  game: ScoredGame;
  tip: ScoredTip;
};

export function calculateTipPoints({
  scoringRules,
  game,
  tip,
}: CalculateTipPointsInput): number {
  if (isExactScore(game, tip)) {
    if (!game.isGroupGame && isDraw(game)) {
      return getPredictedKnockoutAdvancingTeamId(game, tip) ===
        game.advancingTeamId
        ? scoringRules.exactScorePoints
        : scoringRules.goalDifferencePoints;
    }

    return scoringRules.exactScorePoints;
  }

  if (game.isGroupGame) {
    return calculateGroupGameTipPoints(scoringRules, game, tip);
  }

  return calculateKnockoutGameTipPoints(scoringRules, game, tip);
}

function calculateGroupGameTipPoints(
  scoringRules: ScoringRules,
  game: ScoredGame,
  tip: ScoredTip,
): number {
  if (isDraw(game) && isDraw(tip)) {
    return scoringRules.tendencyPoints;
  }

  if (goalDifference(game) === goalDifference(tip)) {
    return scoringRules.goalDifferencePoints;
  }

  if (resultTendency(game) === resultTendency(tip)) {
    return scoringRules.tendencyPoints;
  }

  return 0;
}

function calculateKnockoutGameTipPoints(
  scoringRules: ScoringRules,
  game: ScoredGame,
  tip: ScoredTip,
): number {
  if (!isDraw(game) && goalDifference(game) === goalDifference(tip)) {
    return scoringRules.goalDifferencePoints;
  }

  const actualAdvancingTeamId = getActualKnockoutAdvancingTeamId(game);
  const predictedAdvancingTeamId = getPredictedKnockoutAdvancingTeamId(
    game,
    tip,
  );

  if (
    actualAdvancingTeamId &&
    predictedAdvancingTeamId === actualAdvancingTeamId
  ) {
    return scoringRules.tendencyPoints;
  }

  return 0;
}

function isExactScore(game: ScoredGame, tip: ScoredTip): boolean {
  return game.homeGoals === tip.homeGoals && game.awayGoals === tip.awayGoals;
}

function isDraw(result: Pick<ScoredGame, "homeGoals" | "awayGoals">): boolean {
  return result.homeGoals === result.awayGoals;
}

function goalDifference(
  result: Pick<ScoredGame, "homeGoals" | "awayGoals">,
): number {
  return result.homeGoals - result.awayGoals;
}

function resultTendency(
  result: Pick<ScoredGame, "homeGoals" | "awayGoals">,
): number {
  return Math.sign(goalDifference(result));
}

function getActualKnockoutAdvancingTeamId(game: ScoredGame): string | null {
  return getAdvancingTeamIdFromResult(game, game.advancingTeamId);
}

function getPredictedKnockoutAdvancingTeamId(
  game: ScoredGame,
  tip: ScoredTip,
): string | null {
  return getAdvancingTeamIdFromResult(
    {
      ...game,
      homeGoals: tip.homeGoals,
      awayGoals: tip.awayGoals,
    },
    tip.advancingTeamId,
  );
}

function getAdvancingTeamIdFromResult(
  game: Pick<
    ScoredGame,
    "homeTeamId" | "awayTeamId" | "homeGoals" | "awayGoals"
  >,
  advancingTeamId: string | null,
): string | null {
  if (game.homeGoals > game.awayGoals) {
    return game.homeTeamId;
  }

  if (game.awayGoals > game.homeGoals) {
    return game.awayTeamId;
  }

  return advancingTeamId;
}