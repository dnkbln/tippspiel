import { ApiError } from "./register-user";

export type ScoringRuleValues = {
  exactScorePoints: number;
  goalDifferencePoints: number;
  tendencyPoints: number;
};

export type CompetitionScoringRules = ScoringRuleValues & {
  id: string;
  competitionId: string;
};

export type GetCompetitionScoringRulesResponse = {
  scoringRules: CompetitionScoringRules | null;
  defaultSuggestion: ScoringRuleValues;
};

export async function getCompetitionScoringRules(
  competitionId: string,
): Promise<GetCompetitionScoringRulesResponse> {
  const response = await fetch(
    `/admin/competitions/${encodeURIComponent(competitionId)}/scoring-rules`,
    {
      method: "GET",
    },
  );

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as GetCompetitionScoringRulesResponse;
}
