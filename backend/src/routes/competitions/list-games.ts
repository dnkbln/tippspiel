import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { requireAuth } from "../auth/require-auth.js";
import { listTournamentGames } from "../../services/list-tournament-games.js";

type ListGamesParams = {
  competitionId: string;
};

export async function registerListCompetitionGamesRoute(app: FastifyInstance) {
  app.get<{ Params: ListGamesParams }>(
    "/competitions/:competitionId/games",
    async (request, reply) => {
      try {
        await requireAuth(request);

        const games = await listTournamentGames(request.params.competitionId);

        return reply.code(200).send({
          games,
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
