import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function deleteCompetition(competitionId: string): Promise<void> {
  const competition = await prisma.competition.findUnique({
    where: {
      id: competitionId,
    },
    select: {
      id: true,
      games: {
        select: {
          startsAt: true,
        },
      },
    },
  });

  if (!competition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  const now = new Date();

  const hasStartedGame = competition.games.some((game) => game.startsAt <= now);

  if (hasStartedGame) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "competition can only be deleted before first kickoff",
    );
  }

  await prisma.$transaction([
    prisma.game.deleteMany({
      where: {
        competitionId,
      },
    }),
    prisma.round.deleteMany({
      where: {
        competitionId,
      },
    }),
    prisma.team.deleteMany({
      where: {
        competitionId,
      },
    }),
    prisma.competition.delete({
      where: {
        id: competitionId,
      },
    }),
  ]);
}
