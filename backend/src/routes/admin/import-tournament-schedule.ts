import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { requireAdmin } from "../auth/require-admin.js";
import { importTournamentSchedule } from "../../services/import-tournament-schedule.js";

export async function registerImportTournamentScheduleRoute(app: FastifyInstance) {
  app.post("/admin/import/tournament-schedule", async (request, reply) => {
    try {
      await requireAdmin(request);
      await importTournamentSchedule(request.body);

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
  });
}
