import type { FastifyInstance } from "fastify";

import { AppError } from "../../errors/app-error.js";
import { createInitialAdmin } from "../../services/create-initial-admin.js";

type InitialAdminBody = {
  email: string;
  displayName: string;
  password: string;
};

function parseInitialAdminBody(body: unknown): InitialAdminBody {
  if (!body || typeof body !== "object") {
    throw new AppError("VALIDATION_ERROR", 400, "request body must be an object");
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.email !== "string") {
    throw new AppError("VALIDATION_ERROR", 400, "email must be a string");
  }

  if (typeof candidate.displayName !== "string") {
    throw new AppError("VALIDATION_ERROR", 400, "displayName must be a string");
  }

  if (typeof candidate.password !== "string") {
    throw new AppError("VALIDATION_ERROR", 400, "password must be a string");
  }

  return {
    email: candidate.email,
    displayName: candidate.displayName,
    password: candidate.password,
  };
}

function readBootstrapToken(authorizationHeader: string | undefined): string {
  const prefix = "Bootstrap ";

  if (!authorizationHeader?.startsWith(prefix)) {
    throw new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid");
  }

  const token = authorizationHeader.slice(prefix.length).trim();

  if (!token) {
    throw new AppError("BOOTSTRAP_TOKEN_INVALID", 403, "bootstrap token is invalid");
  }

  return token;
}

export async function registerInitialAdminRoute(app: FastifyInstance) {
  app.post("/setup/initial-admin", async (request, reply) => {
    try {
      const bootstrapToken = readBootstrapToken(request.headers.authorization);
      const parsedBody = parseInitialAdminBody(request.body);

      const result = await createInitialAdmin({
        bootstrapToken,
        ...parsedBody,
      });

      return reply.code(201).send({
        user: result,
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
