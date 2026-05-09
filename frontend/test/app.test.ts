import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("App.vue", () => {
  it("renders a central global error region", () => {
    const appSource = readFileSync(
      new URL("../src/App.vue", import.meta.url),
      "utf-8",
    );

    expect(appSource).toContain("appStore.globalError");
    expect(appSource).toContain('role="alert"');
  });
});
