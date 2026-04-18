import type { FastifyInstance } from "fastify";
import { registerUser } from "../../services/register-user.js";
import { AppError } from "../../errors/app-error.js";

type RegisterBody = {
  email: string;
  displayName: string;
  password: string;
  invitationCode: string;
};

function parseRegisterBody(body: unknown): RegisterBody {
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

  if (typeof candidate.invitationCode !== "string") {
    throw new AppError("VALIDATION_ERROR", 400, "invitationCode must be a string");
  }

  return {
    email: candidate.email,
    displayName: candidate.displayName,
    password: candidate.password,
    invitationCode: candidate.invitationCode
  };
}

export async function registerRegisterRoute(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    try {
      const parsedBody = parseRegisterBody(request.body);
      const result = await registerUser(parsedBody);

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
