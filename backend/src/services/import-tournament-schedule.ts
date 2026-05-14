import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

function parseImportDateTime(value: string, path: string): Date {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      `${path} must be a valid datetime`,
    );
  }

  const hasTimezoneOffset = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);

  if (!hasTimezoneOffset) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      `${path} must include a timezone offset`,
    );
  }

  return parsedDate;
}

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

  const competitionName = competition.name.trim();
  const competitionSlug = competition.slug.trim();
  const teams = candidate.teams;
  const rounds = candidate.rounds;
  const games = candidate.games;

  const seenTeamSlugs = new Set<string>();

  for (let index = 0; index < teams.length; index += 1) {
    const team = teams[index];

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

  for (let index = 0; index < rounds.length; index += 1) {
    const round = rounds[index];

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
    rounds.map((round) => (round as Record<string, unknown>).slug as string),
  );

  const teamSlugs = new Set(
    teams.map((team) => (team as Record<string, unknown>).slug as string),
  );


  for (let index = 0; index < games.length; index += 1) {
    const game = games[index];

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

    const homeTeamSlug =
      typeof gameRecord.homeTeamSlug === "string"
        ? gameRecord.homeTeamSlug.trim()
        : "";
    const homeTeamPlaceholder =
      typeof gameRecord.homeTeamPlaceholder === "string"
        ? gameRecord.homeTeamPlaceholder.trim()
        : "";

    const hasHomeTeamSlug = Boolean(homeTeamSlug);
    const hasHomeTeamPlaceholder = Boolean(homeTeamPlaceholder);

    if (hasHomeTeamSlug === hasHomeTeamPlaceholder) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must define exactly one of homeTeamSlug or homeTeamPlaceholder`,
      );
    }

    if (hasHomeTeamSlug && !teamSlugs.has(homeTeamSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].homeTeamSlug must reference an existing team`,
      );
    }

    const awayTeamSlug =
      typeof gameRecord.awayTeamSlug === "string"
        ? gameRecord.awayTeamSlug.trim()
        : "";
    const awayTeamPlaceholder =
      typeof gameRecord.awayTeamPlaceholder === "string"
        ? gameRecord.awayTeamPlaceholder.trim()
        : "";

    const hasAwayTeamSlug = Boolean(awayTeamSlug);
    const hasAwayTeamPlaceholder = Boolean(awayTeamPlaceholder);

    if (hasAwayTeamSlug === hasAwayTeamPlaceholder) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must define exactly one of awayTeamSlug or awayTeamPlaceholder`,
      );
    }

    if (hasAwayTeamSlug && !teamSlugs.has(awayTeamSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].awayTeamSlug must reference an existing team`,
      );
    }

    if (typeof gameRecord.startsAt !== "string" || !gameRecord.startsAt.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].startsAt is required`,
      );
    }

    parseImportDateTime(gameRecord.startsAt, `games[${index}].startsAt`);

    if (!roundSlugs.has(gameRecord.roundSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].roundSlug must reference an existing round`,
      );
    }

    if (hasHomeTeamSlug && hasAwayTeamSlug && homeTeamSlug === awayTeamSlug) {
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
        name: competitionName,
        slug: competitionSlug,
      },
    });

    await tx.team.createMany({
      data: teams.map((team) => {
        const teamRecord = team as Record<string, unknown>;

        return {
          competitionId: createdCompetition.id,
          name: (teamRecord.name as string).trim(),
          slug: (teamRecord.slug as string).trim(),
        };
      }),
    });

    await tx.round.createMany({
      data: rounds.map((round) => {
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
      data: games.map((game) => {
        const gameRecord = game as Record<string, unknown>;
        const homeTeamSlug =
          typeof gameRecord.homeTeamSlug === "string"
            ? gameRecord.homeTeamSlug.trim()
            : null;
        const awayTeamSlug =
          typeof gameRecord.awayTeamSlug === "string"
            ? gameRecord.awayTeamSlug.trim()
            : null;
        const homeTeamPlaceholder =
          typeof gameRecord.homeTeamPlaceholder === "string"
            ? gameRecord.homeTeamPlaceholder.trim()
            : null;
        const awayTeamPlaceholder =
          typeof gameRecord.awayTeamPlaceholder === "string"
            ? gameRecord.awayTeamPlaceholder.trim()
            : null;

        return {
          competitionId: createdCompetition.id,
          roundId: roundBySlug.get(gameRecord.roundSlug as string)!.id,
          homeTeamId: homeTeamSlug ? teamBySlug.get(homeTeamSlug)!.id : null,
          awayTeamId: awayTeamSlug ? teamBySlug.get(awayTeamSlug)!.id : null,
          homeTeamPlaceholder,
          awayTeamPlaceholder,
          startsAt: parseImportDateTime(
            gameRecord.startsAt as string,
            "games[].startsAt",
          ),
        };
      }),
    });
  });

}
