import { afterEach, describe, expect, it, vi } from "vitest";

import { logoutUser } from "../../src/api/logout-user";

describe("logoutUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the backend logout endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(logoutUser()).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
    });
  });

});
