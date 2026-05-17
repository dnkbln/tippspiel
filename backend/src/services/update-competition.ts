import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export async function updateCompetition(competitionId: string, input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "competition payload must be an object",
    );
  }

  const candidate = input as Record<string, unknown>;

  if (typeof candidate.name !== "string" || !candidate.name.trim()) {
    throw new AppError("VALIDATION_ERROR", 400, "name is required");
  }

  const name = candidate.name.trim();

  const existingCompetition = await prisma.competition.findUnique({
    where: {
      id: competitionId,
    },
    select: {
      id: true,
    },
  });

  if (!existingCompetition) {
    throw new AppError("NOT_FOUND", 404, "competition not found");
  }

  return prisma.competition.update({
    where: {
      id: competitionId,
    },
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}
