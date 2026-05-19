import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

type StandingTeam = {
  id: string;
  name: string;
  slug: string;
};

type StandingRow = {
  rank: number;
  team: StandingTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

function createStanding(team: StandingTeam): StandingRow {
  return {
    rank: 0,
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

export async function getGroupStandings(
  competitionId: string,
  groupSlug: string,
): Promise<StandingRow[]> {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { id: true },
  });

  if (!competition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  const group = await prisma.group.findFirst({
    where: {
      competitionId,
      slug: groupSlug,
    },
    include: {
      teams: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      },
      games: {
        where: {
          resultEnteredAt: { not: null },
        },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeGoals: true,
          awayGoals: true,
        },
      },
    },
  });

  if (!group) {
    throw new AppError("NOT_FOUND", 404, "group not found");
  }

  const standingsByTeamId = new Map(
    group.teams.map((team) => [team.id, createStanding(team)]),
  );

  for (const game of group.games) {
    if (
      !game.homeTeamId ||
      !game.awayTeamId ||
      game.homeGoals === null ||
      game.awayGoals === null
    ) {
      continue;
    }

    const home = standingsByTeamId.get(game.homeTeamId);
    const away = standingsByTeamId.get(game.awayTeamId);

    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;

    home.goalsFor += game.homeGoals;
    home.goalsAgainst += game.awayGoals;
    away.goalsFor += game.awayGoals;
    away.goalsAgainst += game.homeGoals;

    if (game.homeGoals > game.awayGoals) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (game.homeGoals < game.awayGoals) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(standingsByTeamId.values())
    .map((standing) => ({
      ...standing,
      goalDifference: standing.goalsFor - standing.goalsAgainst,
    }))
    .sort((left, right) => (
      right.points - left.points ||
      right.goalDifference - left.goalDifference ||
      right.goalsFor - left.goalsFor ||
      left.team.name.localeCompare(right.team.name) ||
      left.team.id.localeCompare(right.team.id)
    ))
    .map((standing, index) => ({
      ...standing,
      rank: index + 1,
    }));
}
