import type { FastifyInstance } from "fastify";
import { registerListCompetitionsRoute } from "./list-competitions.js";
import { registerListCompetitionGamesRoute } from "./list-games.js";
import { registerGetGroupStandingsRoute } from "./get-group-standings.js";
import { registerSubmitGroupGameTipRoute } from "./submit-group-game-tip.js";
import { registerListMyCompetitionTipsRoute } from "./list-my-competition-tips.js";
import { registerGetCompetitionLeaderboardRoute } from "./get-competition-leaderboard.js";

export async function registerCompetitionRoutes(app: FastifyInstance) {
  await registerListCompetitionsRoute(app);
  await registerListCompetitionGamesRoute(app);
  await registerGetGroupStandingsRoute(app);
  await registerSubmitGroupGameTipRoute(app);
  await registerListMyCompetitionTipsRoute(app);
  await registerGetCompetitionLeaderboardRoute(app);
}
