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

type CompetitionInput = {
  name: string;
  slug: string;
};

type ValidatedGroups = {
  groups: unknown[];
  groupSlugs: Set<string>;
  teamGroupBySlug: Map<string, string>;
};

type ValidatedImport = {
  competition: CompetitionInput;
  teams: unknown[];
  groups: unknown[];
  rounds: unknown[];
  games: unknown[];
  teamGroupBySlug: Map<string, string>;
};

function validateImportPayload(input: unknown): Record<string, unknown> {
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

  if (!Array.isArray(candidate.teams)) {
    throw new AppError("VALIDATION_ERROR", 400, "teams is required");
  }

  if (!Array.isArray(candidate.rounds)) {
    throw new AppError("VALIDATION_ERROR", 400, "rounds is required");
  }

  if (candidate.groups !== undefined && !Array.isArray(candidate.groups)) {
    throw new AppError("VALIDATION_ERROR", 400, "groups must be an array");
  }

  if (!Array.isArray(candidate.games)) {
    throw new AppError("VALIDATION_ERROR", 400, "games is required");
  }

  return candidate;
}

function validateCompetition(candidate: Record<string, unknown>): CompetitionInput {
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

  return {
    name: competition.name.trim(),
    slug: competition.slug.trim(),
  };
}

function validateTeams(teams: unknown[]): Set<string> {
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

  return new Set(
    teams.map((team) => (team as Record<string, unknown>).slug as string),
  );
}

function validateRounds(rounds: unknown[]): Set<string> {
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

  return new Set(
    rounds.map((round) => (round as Record<string, unknown>).slug as string),
  );
}

function validateGroups(
  candidateGroups: unknown[] | undefined,
  teamSlugs: Set<string>,
): ValidatedGroups {
  const groups = candidateGroups ?? [];
  const seenGroupSlugs = new Set<string>();
  const seenGroupOrders = new Set<number>();
  const teamGroupBySlug = new Map<string, string>();

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex];

    if (!group || typeof group !== "object" || Array.isArray(group)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}] must be an object`,
      );
    }

    const groupRecord = group as Record<string, unknown>;

    if (typeof groupRecord.name !== "string" || !groupRecord.name.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].name is required`,
      );
    }

    if (typeof groupRecord.slug !== "string" || !groupRecord.slug.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].slug is required`,
      );
    }

    const groupSlug = groupRecord.slug.trim();

    if (seenGroupSlugs.has(groupSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].slug duplicates "${groupSlug}"`,
      );
    }
    seenGroupSlugs.add(groupSlug);

    if (typeof groupRecord.order !== "number") {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].order is required`,
      );
    }

    if (!Number.isInteger(groupRecord.order)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].order must be an integer`,
      );
    }

    if (seenGroupOrders.has(groupRecord.order)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].order duplicates ${groupRecord.order}`,
      );
    }
    seenGroupOrders.add(groupRecord.order);

    if (!Array.isArray(groupRecord.teamSlugs)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `groups[${groupIndex}].teamSlugs is required`,
      );
    }

    for (
      let teamSlugIndex = 0;
      teamSlugIndex < groupRecord.teamSlugs.length;
      teamSlugIndex += 1
    ) {
      const teamSlug = groupRecord.teamSlugs[teamSlugIndex];

      if (typeof teamSlug !== "string" || !teamSlug.trim()) {
        throw new AppError(
          "VALIDATION_ERROR",
          400,
          `groups[${groupIndex}].teamSlugs[${teamSlugIndex}] must be a non-empty string`,
        );
      }

      const trimmedTeamSlug = teamSlug.trim();

      if (!teamSlugs.has(trimmedTeamSlug)) {
        throw new AppError(
          "VALIDATION_ERROR",
          400,
          `groups[${groupIndex}].teamSlugs[${teamSlugIndex}] must reference an existing team`,
        );
      }

      if (teamGroupBySlug.has(trimmedTeamSlug)) {
        throw new AppError(
          "VALIDATION_ERROR",
          400,
          `groups[${groupIndex}].teamSlugs[${teamSlugIndex}] assigns team "${trimmedTeamSlug}" to multiple groups`,
        );
      }

      teamGroupBySlug.set(trimmedTeamSlug, groupSlug);
    }
  }

  return {
    groups,
    groupSlugs: seenGroupSlugs,
    teamGroupBySlug,
  };
}

function validateGames(
  games: unknown[],
  roundSlugs: Set<string>,
  teamSlugs: Set<string>,
  groupSlugs: Set<string>,
  teamGroupBySlug: Map<string, string>,
): void {
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

    const groupSlug =
      typeof gameRecord.groupSlug === "string" ? gameRecord.groupSlug.trim() : "";
    const hasGroupSlug = Boolean(groupSlug);
    const hasGroupRound = gameRecord.groupRound !== undefined;

    if (hasGroupSlug !== hasGroupRound) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must define groupSlug and groupRound together`,
      );
    }

    if (groupSlug && !groupSlugs.has(groupSlug)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].groupSlug must reference an existing group`,
      );
    }

    if (
      hasGroupSlug &&
      (
        typeof gameRecord.groupRound !== "number" ||
        !Number.isInteger(gameRecord.groupRound) ||
        gameRecord.groupRound < 1
      )
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].groupRound must be a positive integer`,
      );
    }

    if (
      hasGroupSlug &&
      hasHomeTeamSlug &&
      teamGroupBySlug.get(homeTeamSlug) !== groupSlug
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].homeTeamSlug must reference a team from group ${groupSlug}`,
      );
    }

    if (
      hasGroupSlug &&
      hasAwayTeamSlug &&
      teamGroupBySlug.get(awayTeamSlug) !== groupSlug
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}].awayTeamSlug must reference a team from group ${groupSlug}`,
      );
    }

    const isGroupGame =
      hasHomeTeamSlug &&
      hasAwayTeamSlug &&
      teamGroupBySlug.has(homeTeamSlug) &&
      teamGroupBySlug.has(awayTeamSlug);

    if (isGroupGame && !hasGroupSlug) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must define groupSlug and groupRound for group games`,
      );
    }

    if (hasHomeTeamSlug && hasAwayTeamSlug && homeTeamSlug === awayTeamSlug) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must reference two different teams`,
      );
    }

    const isPlaceholderGame = hasHomeTeamPlaceholder || hasAwayTeamPlaceholder;

    if (isPlaceholderGame && (hasGroupSlug || hasGroupRound)) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `games[${index}] must not define groupSlug or groupRound for placeholder games`,
      );
    }

  }
}

async function persistTournamentSchedule(importData: ValidatedImport): Promise<void> {
  const {
    competition,
    teams,
    groups,
    rounds,
    games,
    teamGroupBySlug,
  } = importData;

  await prisma.$transaction(async (tx) => {
    const createdCompetition = await tx.competition.create({
      data: {
        name: competition.name,
        slug: competition.slug,
      },
    });

    await tx.group.createMany({
      data: groups.map((group) => {
        const groupRecord = group as Record<string, unknown>;

        return {
          competitionId: createdCompetition.id,
          name: (groupRecord.name as string).trim(),
          slug: (groupRecord.slug as string).trim(),
          order: groupRecord.order as number,
        };
      }),
    });

    const persistedGroups = await tx.group.findMany({
      where: {
        competitionId: createdCompetition.id,
      },
    });

    const groupBySlug = new Map(
      persistedGroups.map((group) => [group.slug, group]),
    );

    await tx.team.createMany({
      data: teams.map((team) => {
        const teamRecord = team as Record<string, unknown>;
        const teamSlug = (teamRecord.slug as string).trim();
        const groupSlug = teamGroupBySlug.get(teamSlug);

        return {
          competitionId: createdCompetition.id,
          groupId: groupSlug ? groupBySlug.get(groupSlug)!.id : null,
          name: (teamRecord.name as string).trim(),
          slug: teamSlug,
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
        const groupSlug =
          typeof gameRecord.groupSlug === "string"
            ? gameRecord.groupSlug.trim()
            : null;

        return {
          competitionId: createdCompetition.id,
          roundId: roundBySlug.get(gameRecord.roundSlug as string)!.id,
          groupId: groupSlug ? groupBySlug.get(groupSlug)!.id : null,
          groupRound:
            typeof gameRecord.groupRound === "number"
              ? gameRecord.groupRound
              : null,
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

export async function importTournamentSchedule(input: unknown): Promise<void> {
  const candidate = validateImportPayload(input);
  const competition = validateCompetition(candidate);
  const teams = candidate.teams as unknown[];
  const rounds = candidate.rounds as unknown[];
  const games = candidate.games as unknown[];
  const teamSlugs = validateTeams(teams);
  const roundSlugs = validateRounds(rounds);
  const {
    groups,
    groupSlugs,
    teamGroupBySlug,
  } = validateGroups(candidate.groups as unknown[] | undefined, teamSlugs);

  validateGames(games, roundSlugs, teamSlugs, groupSlugs, teamGroupBySlug);

  await persistTournamentSchedule({
    competition,
    teams,
    groups,
    rounds,
    games,
    teamGroupBySlug,
  });

}
