import Fastify from "fastify";

import { registerHealthRoute } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth/index.js";

export async function createApp() {
  const app = Fastify({
    logger: true
  });

  await registerHealthRoute(app);
  await registerAuthRoutes(app);

  return app;
}
