import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { updateCompetition } from "../../services/update-competition.js";
import { requireAdmin } from "../auth/require-admin.js";

type UpdateCompetitionParams = {
  competitionId: string;
};

export async function registerUpdateCompetitionRoute(app: FastifyInstance) {
  app.patch<{ Params: UpdateCompetitionParams }>(
    "/admin/competitions/:competitionId",
    async (request, reply) => {
      try {
        await requireAdmin(request);

        const competition = await updateCompetition(
          request.params.competitionId,
          request.body,
        );

        return reply.code(200).send({
          competition,
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
