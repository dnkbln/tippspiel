import type { FastifyInstance } from "fastify";
import { registerImportTournamentScheduleRoute } from "./import-tournament-schedule.js";
import { registerSetGameParticipantsRoute } from "./set-game-participants.js";
import { registerUpdateCompetitionRoute } from "./update-competition.js";
import { registerDeleteCompetitionRoute } from "./delete-competition.js";
import { registerSetGameResultRoute } from "./set-game-result.js";
import { registerUpsertCompetitionScoringRulesRoute } from "./upsert-competition-scoring-rules.js";
import { registerGetCompetitionScoringRulesRoute } from "./get-competition-scoring-rules.js";

export async function registerAdminRoutes(app: FastifyInstance) {
  await registerImportTournamentScheduleRoute(app);
  await registerSetGameParticipantsRoute(app);
  await registerUpdateCompetitionRoute(app);
  await registerDeleteCompetitionRoute(app);
  await registerSetGameResultRoute(app);
  await registerUpsertCompetitionScoringRulesRoute(app);
  await registerGetCompetitionScoringRulesRoute(app);
}
