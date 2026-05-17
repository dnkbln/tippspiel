import { ApiError } from "./register-user";
import type { Competition } from "./list-competitions";

export type UpdateCompetitionPayload = {
  name: string;
};

export type UpdateCompetitionResponse = {
  competition: Competition;
};

export async function updateCompetition(
  competitionId: string,
  payload: UpdateCompetitionPayload,
): Promise<UpdateCompetitionResponse> {
  const response = await fetch(
    `/admin/competitions/${encodeURIComponent(competitionId)}`,
    {
      method: "PATCH",
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

  return responsePayload as UpdateCompetitionResponse;
}
