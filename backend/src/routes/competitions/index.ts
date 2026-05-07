import type { FastifyInstance } from "fastify";
import { registerListCompetitionGamesRoute } from "./list-games.js";

export async function registerCompetitionRoutes(app: FastifyInstance) {
  await registerListCompetitionGamesRoute(app);
}
