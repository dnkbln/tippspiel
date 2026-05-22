import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { upsertCompetitionScoringRules } from "../../services/upsert-competition-scoring-rules.js";
import { requireAdmin } from "../auth/require-admin.js";

type UpsertCompetitionScoringRulesParams = {
  competitionId: string;
};

export async function registerUpsertCompetitionScoringRulesRoute(
  app: FastifyInstance,
) {
  app.put<{ Params: UpsertCompetitionScoringRulesParams }>(
    "/admin/competitions/:competitionId/scoring-rules",
    async (request, reply) => {
      try {
        await requireAdmin(request);

        const scoringRules = await upsertCompetitionScoringRules(
          request.params.competitionId,
          request.body,
        );

        return reply.code(200).send({
          scoringRules,
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          },
        });
      }
    },
  );
}
