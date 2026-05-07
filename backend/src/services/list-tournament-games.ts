import { prisma } from "../lib/prisma.js";

export async function listTournamentGames(competitionId: string) {
  return prisma.game.findMany({
    where: {
      competitionId,
    },
    include: {
      round: true,
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      startsAt: "asc",
    },
  });
}
