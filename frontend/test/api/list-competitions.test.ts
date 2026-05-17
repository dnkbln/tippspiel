import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../src/api/register-user";
import { listCompetitions } from "../../src/api/list-competitions";

describe("listCompetitions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads available competitions from the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            competitions: [
              { id: "competition-1", name: "WM 2026", slug: "wm-2026" },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(listCompetitions()).resolves.toEqual({
      competitions: [
        { id: "competition-1", name: "WM 2026", slug: "wm-2026" },
      ],
    });

    expect(fetch).toHaveBeenCalledWith("/competitions", {
      method: "GET",
    });
  });

  it("throws an ApiError when loading competitions fails", async () => {
    const errorPayload = {
      error: { code: "UNAUTHORIZED", message: "authentication required" },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 401 }),
      ),
    );

    await expect(listCompetitions()).rejects.toMatchObject({
      status: 401,
      payload: errorPayload,
      message: "authentication required",
    });
  });
});
