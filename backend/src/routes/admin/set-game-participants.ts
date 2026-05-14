import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { setGameParticipants } from "../../services/set-game-participants.js";
import { requireAdmin } from "../auth/require-admin.js";

type SetGameParticipantsParams = {
  gameId: string;
};

export async function registerSetGameParticipantsRoute(app: FastifyInstance) {
  app.patch<{ Params: SetGameParticipantsParams }>(
    "/admin/games/:gameId/participants",
    async (request, reply) => {
      try {
        await requireAdmin(request);
        await setGameParticipants(request.params.gameId, request.body);

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
