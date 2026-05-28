import { ApiError } from "./register-user";

export type MyCompetitionTip = {
  gameId: string;
  homeGoals: number;
  awayGoals: number;
  advancingTeamId: string | null;
};

export type ListMyCompetitionTipsResponse = {
  tips: MyCompetitionTip[];
};

export async function listMyCompetitionTips(
  competitionId: string,
): Promise<ListMyCompetitionTipsResponse> {
  const response = await fetch(
    `/competitions/${encodeURIComponent(competitionId)}/my-tips`,
    {
      method: "GET",
    },
  );

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as ListMyCompetitionTipsResponse;
}