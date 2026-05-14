import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, setGameParticipantsMock } = vi.hoisted(() => {
  return {
    requireAdminMock: vi.fn(),
    setGameParticipantsMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-admin.js", () => {
  return {
    requireAdmin: requireAdminMock,
  };
});

vi.mock("../../../src/services/set-game-participants.js", () => {
  return {
    setGameParticipants: setGameParticipantsMock,
  };
});

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("PATCH /admin/games/:gameId/participants", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 and delegates the participant update for an authenticated admin", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameParticipantsMock.mockResolvedValue(undefined);

    const payload = {
      homeTeamId: "team-1",
      awayTeamId: "team-2",
    };

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/participants",
      payload,
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(setGameParticipantsMock).toHaveBeenCalledWith("game-1", payload);

    await app.close();
  });

  it("returns 400 when the participant update is invalid", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameParticipantsMock.mockRejectedValue(
      new AppError(
        "VALIDATION_ERROR",
        400,
        "game participants can only be changed before kickoff",
      ),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/participants",
      payload: {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "game participants can only be changed before kickoff",
      },
    });

    expect(setGameParticipantsMock).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/participants",
      payload: {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(setGameParticipantsMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 404 when the game does not exist", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameParticipantsMock.mockRejectedValue(
      new AppError("NOT_FOUND", 404, "game not found"),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/participants",
      payload: {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
      },
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "game not found",
      },
    });

    await app.close();
  });

  it("returns 500 when the participant update fails unexpectedly", async () => {
    const app = await createApp();

    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      displayName: "Admin",
      role: "ADMIN",
    });

    setGameParticipantsMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "PATCH",
      url: "/admin/games/game-1/participants",
      payload: {
        homeTeamId: "team-1",
        awayTeamId: "team-2",
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
