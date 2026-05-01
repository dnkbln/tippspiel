import { afterEach, describe, expect, it, vi } from "vitest";

const { logoutUserMock } = vi.hoisted(() => {
  return {
    logoutUserMock: vi.fn(),
  };
});

vi.mock("../../../src/services/logout-user.js", () => {
  return {
    logoutUser: logoutUserMock,
  };
});

import { createApp } from "../../../src/app.js";

describe("POST /auth/logout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204, clears the session cookie and invalidates the session", async () => {
    const app = await createApp();

    logoutUserMock.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");

    expect(response.headers["set-cookie"]).toContain("session=");
    expect(response.headers["set-cookie"]).toContain("HttpOnly");
    expect(response.headers["set-cookie"]).toContain("Path=/");
    expect(response.headers["set-cookie"]).toContain("SameSite=Lax");
    expect(response.headers["set-cookie"]).toContain(
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    );

    expect(logoutUserMock).toHaveBeenCalledWith("session-token");

    await app.close();
  });

  it("returns 204 and clears the cookie even when no session cookie is present", async () => {
    const app = await createApp();

    logoutUserMock.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "POST",
      url: "/auth/logout",
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");

    expect(response.headers["set-cookie"]).toContain("session=");
    expect(response.headers["set-cookie"]).toContain("HttpOnly");
    expect(response.headers["set-cookie"]).toContain("Path=/");
    expect(response.headers["set-cookie"]).toContain("SameSite=Lax");
    expect(response.headers["set-cookie"]).toContain(
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    );

    expect(logoutUserMock).toHaveBeenCalledWith(null);

    await app.close();
  });

});
