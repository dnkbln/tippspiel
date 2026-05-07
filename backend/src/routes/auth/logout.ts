import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { logoutUser } from "../../services/logout-user.js";
import { readSessionToken } from "./read-session-token.js";

function buildClearedSessionCookie(): string {
  return [
    "session=",
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ].join("; ");
}

export async function registerLogoutRoute(app: FastifyInstance) {
  app.post("/auth/logout", async (request, reply) => {
    try {
      const sessionToken = readSessionToken(request.headers.cookie);

      await logoutUser(sessionToken);

      reply.header("Set-Cookie", buildClearedSessionCookie());

      return reply.code(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error);

      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        },
      });
    }
  });
}
