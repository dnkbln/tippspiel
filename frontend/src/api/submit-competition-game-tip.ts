import { ApiError } from "./register-user";

export type SubmitCompetitionGameTipPayload = {
  homeGoals: number;
  awayGoals: number;
  advancingTeamId?: string;
};

export type CompetitionGameTip = {
  id: string;
  userId: string;
  gameId: string;
  homeGoals: number;
  awayGoals: number;
  advancingTeamId: string | null;
};

export type SubmitCompetitionGameTipResponse = {
  tip: CompetitionGameTip;
};

export async function submitCompetitionGameTip(
  competitionId: string,
  gameId: string,
  payload: SubmitCompetitionGameTipPayload,
): Promise<SubmitCompetitionGameTipResponse> {
  const response = await fetch(
    `/competitions/${encodeURIComponent(competitionId)}/games/${encodeURIComponent(gameId)}/tip`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as SubmitCompetitionGameTipResponse;
}