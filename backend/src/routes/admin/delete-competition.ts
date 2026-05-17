import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { deleteCompetition } from "../../services/delete-competition.js";
import { requireAdmin } from "../auth/require-admin.js";

type DeleteCompetitionParams = {
  competitionId: string;
};

export async function registerDeleteCompetitionRoute(app: FastifyInstance) {
  app.delete<{ Params: DeleteCompetitionParams }>(
    "/admin/competitions/:competitionId",
    async (request, reply) => {
      try {
        await requireAdmin(request);
        await deleteCompetition(request.params.competitionId);

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
