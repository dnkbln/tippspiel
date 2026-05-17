import { afterEach, describe, expect, it, vi } from "vitest";

import { updateCompetition } from "../../src/api/update-competition";

describe("updateCompetition", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("updates a competition name through the admin endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            competition: {
              id: "competition-1",
              name: "WM 2026 korrigiert",
              slug: "wm-2026",
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      updateCompetition("competition-1", { name: "WM 2026 korrigiert" }),
    ).resolves.toEqual({
      competition: {
        id: "competition-1",
        name: "WM 2026 korrigiert",
        slug: "wm-2026",
      },
    });

    expect(fetch).toHaveBeenCalledWith("/admin/competitions/competition-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "WM 2026 korrigiert" }),
    });
  });

  it("throws an ApiError when updating a competition fails", async () => {
    const errorPayload = {
      error: {
        code: "VALIDATION_ERROR",
        message: "competition name is required",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 400 }),
      ),
    );

    await expect(
      updateCompetition("competition-1", { name: "" }),
    ).rejects.toMatchObject({
      status: 400,
      payload: errorPayload,
      message: "competition name is required",
    });
  });
});
