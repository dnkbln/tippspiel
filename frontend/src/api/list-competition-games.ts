import { ApiError } from "./register-user";

export type CompetitionGameResultDecision =
  | "REGULAR_TIME"
  | "EXTRA_TIME"
  | "PENALTIES";

export type CompetitionGameTeam = {
  id: string;
  name: string;
  slug: string;
};

export type CompetitionGameGroup = {
  id: string;
  name: string;
  slug: string;
  order: number;
};

export type CompetitionGameRound = {
  id: string;
  name: string;
  slug: string;
  order: number;
};

export type CompetitionGame = {
  id: string;
  startsAt: string;
  round: CompetitionGameRound;
  group: CompetitionGameGroup | null;
  groupRound: number | null;
  homeTeam: CompetitionGameTeam | null;
  awayTeam: CompetitionGameTeam | null;
  homeTeamPlaceholder?: string | null;
  awayTeamPlaceholder?: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  resultDecision: CompetitionGameResultDecision | null;
  advancingTeamId: string | null;
  resultEnteredAt: string | null;
};

export type ListCompetitionGamesResponse = {
  games: CompetitionGame[];
};

export async function listCompetitionGames(
  competitionId: string,
): Promise<ListCompetitionGamesResponse> {
  const response = await fetch(
    `/competitions/${encodeURIComponent(competitionId)}/games`,
    {
      method: "GET",
    },
  );

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as ListCompetitionGamesResponse;
}
