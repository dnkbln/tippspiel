import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { getCompetitionLeaderboard } from "../../services/get-competition-leaderboard.js";
import { requireAuth } from "../auth/require-auth.js";

type GetCompetitionLeaderboardParams = {
  competitionId: string;
};

export async function registerGetCompetitionLeaderboardRoute(
  app: FastifyInstance,
) {
  app.get<{ Params: GetCompetitionLeaderboardParams }>(
    "/competitions/:competitionId/leaderboard",
    async (request, reply) => {
      try {
        await requireAuth(request);

        const leaderboard = await getCompetitionLeaderboard(
          request.params.competitionId,
        );

        return reply.code(200).send({
          leaderboard,
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