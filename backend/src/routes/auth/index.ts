import type { FastifyInstance } from "fastify";
import { registerRegisterRoute } from "./register.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  await registerRegisterRoute(app);
}
