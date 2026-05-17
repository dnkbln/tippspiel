import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, listCompetitionsMock } = vi.hoisted(() => {
  return {
    requireAuthMock: vi.fn(),
    listCompetitionsMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-auth.js", () => {
  return {
    requireAuth: requireAuthMock,
  };
});

vi.mock("../../../src/services/list-competitions.js", () => {
  return {
    listCompetitions: listCompetitionsMock,
  };
});

import { createApp } from "../../../src/app.js";
import { AppError } from "../../../src/errors/app-error.js";

describe("GET /competitions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns available competitions for an authenticated user", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listCompetitionsMock.mockResolvedValue([
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

    const response = await app.inject({
      method: "GET",
      url: "/competitions",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      competitions: [
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
      ],
    });

    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(listCompetitionsMock).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it("returns an empty list when no competitions exist", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listCompetitionsMock.mockResolvedValue([]);

    const response = await app.inject({
      method: "GET",
      url: "/competitions",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      competitions: [],
    });

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createApp();

    requireAuthMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/competitions",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    expect(listCompetitionsMock).not.toHaveBeenCalled();

    await app.close();
  });

  it("returns 500 when listing competitions fails unexpectedly", async () => {
    const app = await createApp();

    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "USER",
    });

    listCompetitionsMock.mockRejectedValue(new Error("database is down"));

    const response = await app.inject({
      method: "GET",
      url: "/competitions",
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
