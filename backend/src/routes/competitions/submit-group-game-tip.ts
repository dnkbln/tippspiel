import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { submitGroupGameTip } from "../../services/submit-group-game-tip.js";
import { requireAuth } from "../auth/require-auth.js";

type SubmitGroupGameTipParams = {
  competitionId: string;
  gameId: string;
};

export async function registerSubmitGroupGameTipRoute(app: FastifyInstance) {
  app.post<{ Params: SubmitGroupGameTipParams }>(
    "/competitions/:competitionId/games/:gameId/tip",
    async (request, reply) => {
      try {
        const user = await requireAuth(request);

        const tip = await submitGroupGameTip(
          user.id,
          request.params.competitionId,
          request.params.gameId,
          request.body,
        );

        return reply.code(201).send({ tip });
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
