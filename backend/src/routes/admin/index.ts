import type { FastifyInstance } from "fastify";
import { registerImportTournamentScheduleRoute } from "./import-tournament-schedule.js";
import { registerSetGameParticipantsRoute } from "./set-game-participants.js";

export async function registerAdminRoutes(app: FastifyInstance) {
  await registerImportTournamentScheduleRoute(app);
  await registerSetGameParticipantsRoute(app);
}
