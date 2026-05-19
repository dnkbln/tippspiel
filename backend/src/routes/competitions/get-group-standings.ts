import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { getGroupStandings } from "../../services/get-group-standings.js";
import { requireAuth } from "../auth/require-auth.js";

type GetGroupStandingsParams = {
  competitionId: string;
  groupSlug: string;
};

export async function registerGetGroupStandingsRoute(app: FastifyInstance) {
  app.get<{ Params: GetGroupStandingsParams }>(
    "/competitions/:competitionId/groups/:groupSlug/standings",
    async (request, reply) => {
      try {
        await requireAuth(request);

        const standings = await getGroupStandings(
          request.params.competitionId,
          request.params.groupSlug,
        );

        return reply.code(200).send({
          standings,
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
