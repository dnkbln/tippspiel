import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useAppStore } from "../../src/stores/app";

describe("app store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("stores and clears a global error message", () => {
    const appStore = useAppStore();

    expect(appStore.globalError).toBeNull();

    appStore.setGlobalError("authentication required");

    expect(appStore.globalError).toBe("authentication required");

    appStore.clearGlobalError();

    expect(appStore.globalError).toBeNull();
  });

  it("stores a parsed global error message from an api payload", () => {
    const appStore = useAppStore();

    appStore.setGlobalErrorFromApiPayload({
      error: {
        code: "FORBIDDEN",
        message: "admin access required",
      },
    });

    expect(appStore.globalError).toBe("admin access required");
  });

});
