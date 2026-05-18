import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { setGameResult } from "../../services/set-game-result.js";
import { requireAdmin } from "../auth/require-admin.js";

type SetGameResultParams = {
  gameId: string;
};

export async function registerSetGameResultRoute(app: FastifyInstance) {
  app.patch<{ Params: SetGameResultParams }>(
    "/admin/games/:gameId/result",
    async (request, reply) => {
      try {
        await requireAdmin(request);
        await setGameResult(request.params.gameId, request.body);

        return reply.code(204).send();
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
