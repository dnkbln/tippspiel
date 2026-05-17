import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, deleteCompetitionMock } = vi.hoisted(() => {
  return {
    requireAdminMock: vi.fn(),
    deleteCompetitionMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-admin.js", () => {
  return {
    requireAdmin: requireAdminMock,
  };
});

vi.mock("../../../src/services/delete-competition.js", () => {
  return {
    deleteCompetition: deleteCompetitionMock,
  };
});

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("DELETE /admin/competitions/:competitionId", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 and deletes the competition for an authenticated admin", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    deleteCompetitionMock.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "DELETE",
      url: "/admin/competitions/competition-1",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(deleteCompetitionMock).toHaveBeenCalledWith("competition-1");

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "DELETE",
      url: "/admin/competitions/competition-1",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(deleteCompetitionMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 403 when the authenticated user is not an admin", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "admin access required"),
    );

    const response = await app.inject({
      method: "DELETE",
      url: "/admin/competitions/competition-1",
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

    expect(deleteCompetitionMock).not.toHaveBeenCalled();

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

    deleteCompetitionMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "competition not found"),
    );

    const response = await app.inject({
      method: "DELETE",
      url: "/admin/competitions/competition-1",
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

  it("returns 400 when the competition cannot be deleted anymore", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    deleteCompetitionMock.mockRejectedValue(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "competition can only be deleted before first kickoff",
      ),
    );

    const response = await app.inject({
      method: "DELETE",
      url: "/admin/competitions/competition-1",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "competition can only be deleted before first kickoff",
      },
    });

    await app.close();
  });

  it("returns 500 when deletion fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    deleteCompetitionMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "DELETE",
      url: "/admin/competitions/competition-1",
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
