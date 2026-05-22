import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

const defaultScoringRulesSuggestion = {
  exactScorePoints: 3,
  goalDifferencePoints: 2,
  tendencyPoints: 1,
};

export async function getCompetitionScoringRules(competitionId: string) {
  const competition = await prisma.competition.findUnique({
    where: {
      id: competitionId,
    },
    select: {
      id: true,
      scoringRule: {
        select: {
          id: true,
          competitionId: true,
          exactScorePoints: true,
          goalDifferencePoints: true,
          tendencyPoints: true,
        },
      },
    },
  });

  if (!competition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  return {
    scoringRules: competition.scoringRule,
    defaultSuggestion: defaultScoringRulesSuggestion,
  };
}
