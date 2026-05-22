import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, getCompetitionScoringRulesMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  getCompetitionScoringRulesMock: vi.fn(),
}));

vi.mock("../../../src/routes/auth/require-admin.js", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("../../../src/services/get-competition-scoring-rules.js", () => ({
  getCompetitionScoringRules: getCompetitionScoringRulesMock,
}));

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("GET /admin/competitions/:competitionId/scoring-rules", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns stored scoring rules and default suggestion for an authenticated admin", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    getCompetitionScoringRulesMock.mockResolvedValue({
      scoringRules: {
        id: "rules-1",
        competitionId: "competition-1",
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/admin/competitions/competition-1/scoring-rules",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      scoringRules: {
        id: "rules-1",
        competitionId: "competition-1",
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(getCompetitionScoringRulesMock).toHaveBeenCalledWith("competition-1");

    await app.close();
  });

  it("returns null scoring rules when no scoring rules are stored", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    getCompetitionScoringRulesMock.mockResolvedValue({
      scoringRules: null,
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/admin/competitions/competition-1/scoring-rules",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      scoringRules: null,
      defaultSuggestion: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/admin/competitions/competition-1/scoring-rules",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(getCompetitionScoringRulesMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 403 when the authenticated user is not an admin", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "admin access required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/admin/competitions/competition-1/scoring-rules",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "admin access required",
      },
    });

    expect(getCompetitionScoringRulesMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 404 when the competition does not exist", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    getCompetitionScoringRulesMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/admin/competitions/competition-1/scoring-rules",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "competition not found",
      },
    });

    await app.close();
  });

  it("returns 500 when loading scoring rules fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    getCompetitionScoringRulesMock.mockRejectedValue(
      new Error("database is down"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/admin/competitions/competition-1/scoring-rules",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
    });

    await app.close();
  });
});
