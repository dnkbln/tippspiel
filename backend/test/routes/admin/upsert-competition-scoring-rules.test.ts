import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, upsertCompetitionScoringRulesMock } = vi.hoisted(
  () => ({
    requireAdminMock: vi.fn(),
    upsertCompetitionScoringRulesMock: vi.fn(),
  }),
);

vi.mock("../../../src/routes/auth/require-admin.js", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("../../../src/services/upsert-competition-scoring-rules.js", () => ({
  upsertCompetitionScoringRules: upsertCompetitionScoringRulesMock,
}));

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("PUT /admin/competitions/:competitionId/scoring-rules", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns stored scoring rules for an authenticated admin", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    upsertCompetitionScoringRulesMock.mockResolvedValue({
      id: "rules-1",
      competitionId: "competition-1",
      exactScorePoints: 3,
      goalDifferencePoints: 2,
      tendencyPoints: 1,
    });

    const payload = {
      exactScorePoints: 3,
      goalDifferencePoints: 2,
      tendencyPoints: 1,
    };

    const response = await app.inject({
      method: "PUT",
      url: "/admin/competitions/competition-1/scoring-rules",
      payload,
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
    });

    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(upsertCompetitionScoringRulesMock).toHaveBeenCalledWith(
      "competition-1",
      payload,
    );

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "PUT",
      url: "/admin/competitions/competition-1/scoring-rules",
      payload: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(upsertCompetitionScoringRulesMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 403 when the authenticated user is not an admin", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "admin access required"),
    );

    const response = await app.inject({
      method: "PUT",
      url: "/admin/competitions/competition-1/scoring-rules",
      payload: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
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

    expect(upsertCompetitionScoringRulesMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns service validation errors", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    upsertCompetitionScoringRulesMock.mockRejectedValue(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "exactScorePoints must be a non-negative integer",
      ),
    );

    const response = await app.inject({
      method: "PUT",
      url: "/admin/competitions/competition-1/scoring-rules",
      payload: {
        exactScorePoints: -1,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "exactScorePoints must be a non-negative integer",
      },
    });

    await app.close();
  });

  it("returns 500 when storing scoring rules fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    upsertCompetitionScoringRulesMock.mockRejectedValue(
      new Error("database is down"),
    );

    const response = await app.inject({
      method: "PUT",
      url: "/admin/competitions/competition-1/scoring-rules",
      payload: {
        exactScorePoints: 3,
        goalDifferencePoints: 2,
        tendencyPoints: 1,
      },
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
