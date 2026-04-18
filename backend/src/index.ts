import { env } from "./config/env.js";
import { createApp } from "./app.js";

async function start() {
  const app = await createApp();

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
