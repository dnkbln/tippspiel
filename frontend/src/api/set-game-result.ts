import { ApiError } from "./register-user";

export type GameResultDecision = "REGULAR_TIME" | "EXTRA_TIME" | "PENALTIES";

export type SetGameResultPayload = {
  homeGoals: number;
  awayGoals: number;
  resultDecision: GameResultDecision;
  advancingTeamId?: string;
};

export async function setGameResult(
  gameId: string,
  payload: SetGameResultPayload,
): Promise<void> {
  const response = await fetch(
    `/admin/games/${encodeURIComponent(gameId)}/result`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (response.ok) {
    return;
  }

  const responsePayload = (await response.json()) as unknown;
  throw new ApiError(response.status, responsePayload);
}