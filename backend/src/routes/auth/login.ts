import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app-error.js";
import { loginUser } from "../../services/login-user.js";

type LoginBody = {
  email: string;
  password: string;
};

function parseLoginBody(body: unknown): LoginBody {
  if (!body || typeof body !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "request body must be an object",
    );
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.email !== "string") {
    throw new AppError("VALIDATION_ERROR", 400, "email must be a string");
  }

  if (typeof candidate.password !== "string") {
    throw new AppError("VALIDATION_ERROR", 400, "password must be a string");
  }

  return {
    email: candidate.email,
    password: candidate.password,
  };
}

function buildSessionCookie(token: string, expiresAt: Date): string {
  const encodedToken = encodeURIComponent(token);

  return [
    `session=${encodedToken}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ].join("; ");
}

export async function registerLoginRoute(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    try {
      const parsedBody = parseLoginBody(request.body);
      const result = await loginUser(parsedBody);

      reply.header(
        "Set-Cookie",
        buildSessionCookie(result.sessionToken, result.sessionExpiresAt),
      );

      return reply.code(200).send({
        user: result.user,
      });
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
