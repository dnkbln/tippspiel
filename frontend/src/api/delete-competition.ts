import { ApiError } from "./register-user";

export async function deleteCompetition(competitionId: string): Promise<void> {
  const response = await fetch(
    `/admin/competitions/${encodeURIComponent(competitionId)}`,
    {
      method: "DELETE",
    },
  );

  if (response.ok) {
    return;
  }

  const responsePayload = (await response.json()) as unknown;
  throw new ApiError(response.status, responsePayload);
}
