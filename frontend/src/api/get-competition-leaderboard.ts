import { ApiError } from "./register-user";

export type CompetitionLeaderboardEntry = {
  rank: number;
  user: {
    id: string;
    displayName: string;
  };
  totalPoints: number;
};

export type GetCompetitionLeaderboardResponse = {
  leaderboard: CompetitionLeaderboardEntry[];
};

export async function getCompetitionLeaderboard(
  competitionId: string,
): Promise<GetCompetitionLeaderboardResponse> {
  const response = await fetch(
    `/competitions/${encodeURIComponent(competitionId)}/leaderboard`,
    {
      method: "GET",
    },
  );

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as GetCompetitionLeaderboardResponse;
}