import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { getCompetitionScoringRules } from "../../services/get-competition-scoring-rules.js";
import { requireAdmin } from "../auth/require-admin.js";

type GetCompetitionScoringRulesParams = {
  competitionId: string;
};

export async function registerGetCompetitionScoringRulesRoute(
  app: FastifyInstance,
) {
  app.get<{ Params: GetCompetitionScoringRulesParams }>(
    "/admin/competitions/:competitionId/scoring-rules",
    async (request, reply) => {
      try {
        await requireAdmin(request);

        const result = await getCompetitionScoringRules(
          request.params.competitionId,
        );

        return reply.code(200).send(result);
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
