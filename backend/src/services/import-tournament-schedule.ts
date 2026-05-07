import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function importTournamentSchedule(input: unknown): Promise<void> {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "import payload must be an object",
    );
  }

  const candidate = input as Record<string, unknown>;

  if (!candidate.competition || typeof candidate.competition !== "object") {
    throw new AppError("VALIDATION_ERROR", 400, "competition is required");
  }

  const competition = candidate.competition as Record<string, unknown>;

  if (typeof competition.name !== "string" || !competition.name.trim()) {
    throw new AppError("VALIDATION_ERROR", 400, "competition.name is required");
  }

  if (typeof competition.slug !== "string" || !competition.slug.trim()) {
    throw new AppError("VALIDATION_ERROR", 400, "competition.slug is required");
  }

  if (!Array.isArray(candidate.teams)) {
    throw new AppError("VALIDATION_ERROR", 400, "teams is required");
  }

  if (!Array.isArray(candidate.rounds)) {
    throw new AppError("VALIDATION_ERROR", 400, "rounds is required");
  }

  if (!Array.isArray(candidate.games)) {
    throw new AppError("VALIDATION_ERROR", 400, "games is required");
  }

  const seenTeamSlugs = new Set<string>();

  for (let index = 0; index < candidate.teams.length; index += 1) {
    const team = candidate.teams[index];

    if (!team || typeof team !== "object" || Array.isArray(team)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `teams[${index}] must be an object`,
      );
    }

    const teamRecord = team as Record<string, unknown>;

    if (typeof teamRecord.name !== "string" || !teamRecord.name.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `teams[${index}].name is required`,
      );
    }

    if (typeof teamRecord.slug !== "string" || !teamRecord.slug.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `teams[${index}].slug is required`,
      );
    }

    if (seenTeamSlugs.has(teamRecord.slug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `teams[${index}].slug duplicates "${teamRecord.slug}"`,
      );
    }

    seenTeamSlugs.add(teamRecord.slug);
  }

  const seenRoundSlugs = new Set<string>();
  const seenRoundOrders = new Set<number>();

  for (let index = 0; index < candidate.rounds.length; index += 1) {
    const round = candidate.rounds[index];

    if (!round || typeof round !== "object" || Array.isArray(round)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}] must be an object`,
      );
    }

    const roundRecord = round as Record<string, unknown>;

    if (typeof roundRecord.name !== "string" || !roundRecord.name.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}].name is required`,
      );
    }

    if (typeof roundRecord.slug !== "string" || !roundRecord.slug.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}].slug is required`,
      );
    }

    if (seenRoundSlugs.has(roundRecord.slug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}].slug duplicates "${roundRecord.slug}"`,
      );
    }
    seenRoundSlugs.add(roundRecord.slug);

    if (typeof roundRecord.order !== "number") {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}].order is required`,
      );
    }

    if (!Number.isInteger(roundRecord.order)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}].order must be an integer`,
      );
    }

    if (seenRoundOrders.has(roundRecord.order)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `rounds[${index}].order duplicates ${roundRecord.order}`,
      );
    }

    seenRoundOrders.add(roundRecord.order);
  }

  const roundSlugs = new Set(
    candidate.rounds.map((round) => (round as Record<string, unknown>).slug as string),
  );

  const teamSlugs = new Set(
    candidate.teams.map((team) => (team as Record<string, unknown>).slug as string),
  );


  for (let index = 0; index < candidate.games.length; index += 1) {
    const game = candidate.games[index];

    if (!game || typeof game !== "object" || Array.isArray(game)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must be an object`,
      );
    }

    const gameRecord = game as Record<string, unknown>;

    if (
      typeof gameRecord.roundSlug !== "string" ||
      !gameRecord.roundSlug.trim()
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].roundSlug is required`,
      );
    }

    if (
      typeof gameRecord.homeTeamSlug !== "string" ||
      !gameRecord.homeTeamSlug.trim()
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].homeTeamSlug is required`,
      );
    }

    if (
      typeof gameRecord.awayTeamSlug !== "string" ||
      !gameRecord.awayTeamSlug.trim()
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].awayTeamSlug is required`,
      );
    }

    if (typeof gameRecord.startsAt !== "string" || !gameRecord.startsAt.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].startsAt is required`,
      );
    }

    const startsAt = new Date(gameRecord.startsAt);

    if (Number.isNaN(startsAt.getTime())) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].startsAt must be a valid datetime`,
      );
    }

    if (!roundSlugs.has(gameRecord.roundSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].roundSlug must reference an existing round`,
      );
    }

    if (!teamSlugs.has(gameRecord.homeTeamSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].homeTeamSlug must reference an existing team`,
      );
    }

    if (!teamSlugs.has(gameRecord.awayTeamSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].awayTeamSlug must reference an existing team`,
      );
    }

    if (gameRecord.homeTeamSlug === gameRecord.awayTeamSlug) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must reference two different teams`,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    const createdCompetition = await tx.competition.create({
      data: {
        name: competition.name.trim(),
        slug: competition.slug.trim(),
      },
    });

    await tx.team.createMany({
      data: candidate.teams.map((team) => {
        const teamRecord = team as Record<string, unknown>;

        return {
          competitionId: createdCompetition.id,
          name: (teamRecord.name as string).trim(),
          slug: (teamRecord.slug as string).trim(),
        };
      }),
    });

    await tx.round.createMany({
      data: candidate.rounds.map((round) => {
        const roundRecord = round as Record<string, unknown>;

        return {
          competitionId: createdCompetition.id,
          name: (roundRecord.name as string).trim(),
          slug: (roundRecord.slug as string).trim(),
          order: roundRecord.order as number,
        };
      }),
    });

    const persistedTeams = await tx.team.findMany({
      where: {
        competitionId: createdCompetition.id,
      },
    });

    const persistedRounds = await tx.round.findMany({
      where: {
        competitionId: createdCompetition.id,
      },
    });

    const teamBySlug = new Map(persistedTeams.map((team) => [team.slug, team]));
    const roundBySlug = new Map(persistedRounds.map((round) => [round.slug, round]));

    await tx.game.createMany({
      data: candidate.games.map((game) => {
        const gameRecord = game as Record<string, unknown>;

        return {
          competitionId: createdCompetition.id,
          roundId: roundBySlug.get(gameRecord.roundSlug as string)!.id,
          homeTeamId: teamBySlug.get(gameRecord.homeTeamSlug as string)!.id,
          awayTeamId: teamBySlug.get(gameRecord.awayTeamSlug as string)!.id,
          startsAt: new Date(gameRecord.startsAt as string),
        };
      }),
    });
  });

}
