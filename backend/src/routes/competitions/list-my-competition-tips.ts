import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { listMyCompetitionTips } from "../../services/list-my-competition-tips.js";
import { requireAuth } from "../auth/require-auth.js";

type ListMyCompetitionTipsParams = {
  competitionId: string;
};

export async function registerListMyCompetitionTipsRoute(app: FastifyInstance) {
  app.get<{ Params: ListMyCompetitionTipsParams }>(
    "/competitions/:competitionId/my-tips",
    async (request, reply) => {
      try {
        const user = await requireAuth(request);

        const tips = await listMyCompetitionTips(
          user.id,
          request.params.competitionId,
        );

        return reply.code(200).send({ tips });
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