import { ApiError } from "./register-user";
import type {
  CompetitionScoringRules,
  ScoringRuleValues,
} from "./get-competition-scoring-rules";

export type UpsertCompetitionScoringRulesResponse = {
  scoringRules: CompetitionScoringRules;
};

export async function upsertCompetitionScoringRules(
  competitionId: string,
  payload: ScoringRuleValues,
): Promise<UpsertCompetitionScoringRulesResponse> {
  const response = await fetch(
    `/admin/competitions/${encodeURIComponent(competitionId)}/scoring-rules`,
    {
      method: "PUT",
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

  return responsePayload as UpsertCompetitionScoringRulesResponse;
}
