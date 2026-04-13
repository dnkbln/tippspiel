import Fastify from "fastify";

import { env } from "./config/env.js";
import { registerHealthRoute } from "./routes/health.js";

async function start() {
  const app = Fastify({
    logger: true
  });

  await registerHealthRoute(app);

  try {
    await app.listen({
      host: env.host,
      port: env.port
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();

