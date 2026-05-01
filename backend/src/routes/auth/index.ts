import type { FastifyInstance } from "fastify";
import { registerRegisterRoute } from "./register.js";
import { registerLoginRoute } from "./login.js";
import { registerLogoutRoute } from "./logout.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  await registerRegisterRoute(app);
  await registerLoginRoute(app);
  await registerLogoutRoute(app);
}
