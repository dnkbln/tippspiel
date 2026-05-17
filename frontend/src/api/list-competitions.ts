import { ApiError } from "./register-user";

export type Competition = {
  id: string;
  name: string;
  slug: string;
};

export type ListCompetitionsResponse = {
  competitions: Competition[];
};

export async function listCompetitions(): Promise<ListCompetitionsResponse> {
  const response = await fetch("/competitions", {
    method: "GET",
  });

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as ListCompetitionsResponse;
}
