import type { FastifyInstance } from "fastify";
import { registerListCompetitionsRoute } from "./list-competitions.js";
import { registerListCompetitionGamesRoute } from "./list-games.js";

export async function registerCompetitionRoutes(app: FastifyInstance) {
  await registerListCompetitionsRoute(app);
  await registerListCompetitionGamesRoute(app);
}
