import type { FastifyInstance } from "fastify";
import { registerImportTournamentScheduleRoute } from "./import-tournament-schedule.js";

export async function registerAdminRoutes(app: FastifyInstance) {
  await registerImportTournamentScheduleRoute(app);
}
