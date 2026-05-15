// frontend/test/api/import-tournament-schedule.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

import { importTournamentSchedule } from "../../src/api/import-tournament-schedule";

const payload = {
  competition: {
    name: "Fussball-WM 2026",
    slug: "fussball-wm-2026",
  },
  teams: [],
  rounds: [],
  games: [],
};

describe("importTournamentSchedule", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the schedule payload to the admin import endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(importTournamentSchedule(payload)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith("/admin/import/tournament-schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  });

  it("throws an ApiError with the backend payload when the import fails", async () => {
    const errorPayload = {
      error: {
        code: "INVALID_IMPORT_PAYLOAD",
        message: "games is required",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 400,
        }),
      ),
    );

    await expect(importTournamentSchedule(payload)).rejects.toMatchObject({
      status: 400,
      payload: errorPayload,
      message: "games is required",
    });
  });
});
