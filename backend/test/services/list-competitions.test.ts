import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      competition: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { listCompetitions } from "../../src/services/list-competitions.js";

describe("listCompetitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns available competitions with public list fields ordered by name", async () => {
    prismaMock.competition.findMany.mockResolvedValue([
      {
        id: "competition-1",
        name: "EM 2028",
        slug: "em-2028",
      },
      {
        id: "competition-2",
        name: "WM 2026",
        slug: "wm-2026",
      },
    ]);

    const result = await listCompetitions();

    expect(result).toEqual([
      {
        id: "competition-1",
        name: "EM 2028",
        slug: "em-2028",
      },
      {
        id: "competition-2",
        name: "WM 2026",
        slug: "wm-2026",
      },
    ]);

    expect(prismaMock.competition.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  });

  it("returns an empty list when no competitions exist", async () => {
    prismaMock.competition.findMany.mockResolvedValue([]);

    const result = await listCompetitions();

    expect(result).toEqual([]);
  });
});
