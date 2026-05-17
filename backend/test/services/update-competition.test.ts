import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/app-error.js";

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      competition: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

vi.mock("../../src/lib/prisma.js", () => {
  return {
    prisma: prismaMock,
  };
});

import { updateCompetition } from "../../src/services/update-competition.js";

describe("updateCompetition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trims and updates the competition name without changing id or slug", async () => {
    prismaMock.competition.findUnique.mockResolvedValue({
      id: "competition-1",
    });

    prismaMock.competition.update.mockResolvedValue({
      id: "competition-1",
      name: "WM 2026 korrigiert",
      slug: "wm-2026",
    });

    const result = await updateCompetition("competition-1", {
      name: "  WM 2026 korrigiert  ",
    });

    expect(result).toEqual({
      id: "competition-1",
      name: "WM 2026 korrigiert",
      slug: "wm-2026",
    });

    expect(prismaMock.competition.update).toHaveBeenCalledWith({
      where: {
        id: "competition-1",
      },
      data: {
        name: "WM 2026 korrigiert",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  });

  it("throws when the name is missing or empty", async () => {
    await expect(
      updateCompetition("competition-1", { name: "   " }),
    ).rejects.toEqual(
      new AppError("VALIDATION_ERROR", 400, "name is required"),
    );

    expect(prismaMock.competition.update).not.toHaveBeenCalled();
  });

  it("throws when the competition does not exist", async () => {
    prismaMock.competition.findUnique.mockResolvedValue(null);

    await expect(
      updateCompetition("competition-1", { name: "WM 2026" }),
    ).rejects.toEqual(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    expect(prismaMock.competition.update).not.toHaveBeenCalled();
  });
});
