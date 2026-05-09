import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("main.ts", () => {
  it("creates the browser router with the auth store state source", () => {
    const mainSource = readFileSync(
      new URL("../src/main.ts", import.meta.url),
      "utf-8",
    );

    expect(mainSource).toContain("createBrowserRouter");
    expect(mainSource).toContain("useAuthStore");
    expect(mainSource).toContain("authStore.authState");
  });

});
