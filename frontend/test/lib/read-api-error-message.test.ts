import { describe, expect, it } from "vitest";

import { readApiErrorMessage } from "../../src/lib/read-api-error-message";

describe("readApiErrorMessage", () => {
  it("returns the backend error message from the known error payload", () => {
    expect(
      readApiErrorMessage({
        error: {
          code: "UNAUTHORIZED",
          message: "authentication required",
        },
      }),
    ).toBe("authentication required");
  });

  it("falls back to a generic message for unknown payloads", () => {
    expect(readApiErrorMessage({ foo: "bar" })).toBe("Unbekannter Fehler");
  });
});
