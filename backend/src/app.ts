import Fastify from "fastify";

import { registerHealthRoute } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth/index.js";
import { registerAdminRoutes } from "./routes/admin/index.js";
import { registerCompetitionRoutes } from "./routes/competitions/index.js";
import { registerSetupRoutes } from "./routes/setup/index.js";

export async function createApp() {
  const app = Fastify({
    logger: true
  });

  await registerHealthRoute(app);
  await registerAuthRoutes(app);
  await registerAdminRoutes(app);
  await registerCompetitionRoutes(app);
  await registerSetupRoutes(app);

  return app;
}
