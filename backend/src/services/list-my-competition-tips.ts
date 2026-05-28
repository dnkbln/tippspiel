import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function listMyCompetitionTips(
  userId: string,
  competitionId: string,
) {
  const competition = await prisma.competition.findUnique({
    where: {
      id: competitionId,
    },
    select: {
      id: true,
    },
  });

  if (!competition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  return prisma.tip.findMany({
    where: {
      userId,
      game: {
        competitionId,
      },
    },
    select: {
      gameId: true,
      homeGoals: true,
      awayGoals: true,
      advancingTeamId: true,
      points: true,
    },
    orderBy: {
      game: {
        startsAt: "asc",
      },
    },
  });
}