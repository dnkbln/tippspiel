import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useAuthStore } from "../../src/stores/auth";

describe("auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("treats guests as unauthenticated non-admin users by default", () => {
    const authStore = useAuthStore();

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.isAdmin).toBe(false);
    expect(authStore.role).toBeNull();
  });

  it("marks a user as authenticated when a role is set", () => {
    const authStore = useAuthStore();

    authStore.setRole("USER");

    expect(authStore.role).toBe("USER");
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.isAdmin).toBe(false);
  });

  it("marks an admin as authenticated admin when the admin role is set", () => {
    const authStore = useAuthStore();

    authStore.setRole("ADMIN");

    expect(authStore.role).toBe("ADMIN");
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.isAdmin).toBe(true);
  });

  it("exposes the auth state required by the router", () => {
    const authStore = useAuthStore();

    authStore.setRole("ADMIN");

    expect(authStore.authState).toEqual({
      isAuthenticated: true,
      isAdmin: true,
    });
  });

});
