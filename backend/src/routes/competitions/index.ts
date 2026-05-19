import type { FastifyInstance } from "fastify";
import { registerListCompetitionsRoute } from "./list-competitions.js";
import { registerListCompetitionGamesRoute } from "./list-games.js";
import { registerGetGroupStandingsRoute } from "./get-group-standings.js";

export async function registerCompetitionRoutes(app: FastifyInstance) {
  await registerListCompetitionsRoute(app);
  await registerListCompetitionGamesRoute(app);
  await registerGetGroupStandingsRoute(app);
}
