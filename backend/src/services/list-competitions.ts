import { prisma } from "../lib/prisma.js";

export async function listCompetitions() {
  return prisma.competition.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
