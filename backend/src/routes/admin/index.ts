import type { FastifyInstance } from "fastify";
import { registerImportTournamentScheduleRoute } from "./import-tournament-schedule.js";
import { registerSetGameParticipantsRoute } from "./set-game-participants.js";
import { registerUpdateCompetitionRoute } from "./update-competition.js";
import { registerDeleteCompetitionRoute } from "./delete-competition.js";
import { registerSetGameResultRoute } from "./set-game-result.js";

export async function registerAdminRoutes(app: FastifyInstance) {
  await registerImportTournamentScheduleRoute(app);
  await registerSetGameParticipantsRoute(app);
  await registerUpdateCompetitionRoute(app);
  await registerDeleteCompetitionRoute(app);
  await registerSetGameResultRoute(app);
}
