import { ApiError } from "./register-user";

export type CompetitionGameTeam = {
  id: string;
  name: string;
  slug: string;
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
  homeTeam: CompetitionGameTeam | null;
  awayTeam: CompetitionGameTeam | null;
  homeTeamPlaceholder?: string | null;
  awayTeamPlaceholder?: string | null;
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
