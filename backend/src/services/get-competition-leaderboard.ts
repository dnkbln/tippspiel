import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

type LeaderboardUser = {
  id: string;
  displayName: string;
};

type LeaderboardEntry = {
  rank: number;
  user: LeaderboardUser;
  totalPoints: number;
};

export async function getCompetitionLeaderboard(
  competitionId: string,
): Promise<LeaderboardEntry[]> {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true },
  });

  if (!competition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  const tips = await prisma.tip.findMany({
    where: {
      game: {
        competitionId,
      },
      points: {
        not: null,
      },
    },
    select: {
      points: true,
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  });

  const entriesByUserId = new Map<string, Omit<LeaderboardEntry, "rank">>();

  for (const tip of tips) {
    const existing = entriesByUserId.get(tip.user.id);

    if (existing) {
      existing.totalPoints += tip.points ?? 0;
      continue;
    }

    entriesByUserId.set(tip.user.id, {
      user: tip.user,
      totalPoints: tip.points ?? 0,
    });
  }

  return Array.from(entriesByUserId.values())
    .sort(
      (left, right) =>
        right.totalPoints - left.totalPoints ||
        left.user.displayName.localeCompare(right.user.displayName) ||
        left.user.id.localeCompare(right.user.id),
    )
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
}