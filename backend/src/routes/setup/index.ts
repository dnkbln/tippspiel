import type { FastifyInstance } from "fastify";

import { registerInitialAdminRoute } from "./initial-admin.js";

export async function registerSetupRoutes(app: FastifyInstance) {
  await registerInitialAdminRoute(app);
}
