import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../src/api/register-user";
import { deleteCompetition } from "../../src/api/delete-competition";

describe("deleteCompetition", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes a competition through the admin endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(deleteCompetition("competition-1")).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith("/admin/competitions/competition-1", {
      method: "DELETE",
    });
  });

  it("throws an ApiError when deleting a competition fails", async () => {
    const errorPayload = {
      error: {
        code: "VALIDATION_ERROR",
        message: "competition can only be deleted before first kickoff",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorPayload), { status: 400 }),
      ),
    );

    await expect(deleteCompetition("competition-1")).rejects.toMatchObject({
      status: 400,
      payload: errorPayload,
      message: "competition can only be deleted before first kickoff",
    });
  });
});
