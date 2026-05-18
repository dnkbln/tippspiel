import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function listTournamentGames(competitionId: string) {
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

  return prisma.game.findMany({
    where: {
      competitionId,
    },
    include: {
      round: true,
      group: true,
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: [
      { round: { order: "asc" } },
      { group: { order: "asc" } },
      { groupRound: "asc" },
      { startsAt: "asc" },
    ],
  });
}
