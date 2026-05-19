import { describe, expect, it } from "vitest";

import { formatBerlinDateTime } from "../../src/lib/format-berlin-date-time";

describe("formatBerlinDateTime", () => {
  it("formats UTC kickoff times in Berlin summer time", () => {
    expect(formatBerlinDateTime("2026-06-14T17:00:00.000Z")).toBe(
      "14.06.2026, 19:00",
    );
  });

  it("formats UTC kickoff times in Berlin winter time", () => {
    expect(formatBerlinDateTime("2026-12-14T17:00:00.000Z")).toBe(
      "14.12.2026, 18:00",
    );
  });
});
