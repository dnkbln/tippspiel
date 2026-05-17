import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { listCompetitions } from "../../services/list-competitions.js";
import { requireAuth } from "../auth/require-auth.js";

export async function registerListCompetitionsRoute(app: FastifyInstance) {
  app.get("/competitions", async (request, reply) => {
    try {
      await requireAuth(request);

      const competitions = await listCompetitions();

      return reply.code(200).send({
        competitions,
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
  });
}
