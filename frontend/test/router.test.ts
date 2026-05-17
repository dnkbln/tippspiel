import { describe, expect, it } from "vitest";

import { createAppRouter, createMemoryHistory } from "../src/router";

describe("router", () => {
  it("defines the public, protected and admin routes for US-30", () => {
    const router = createAppRouter(createMemoryHistory());
    const routes = router.getRoutes();

    const home = routes.find((route) => route.name === "home");
    const register = routes.find((route) => route.name === "register");
    const login = routes.find((route) => route.name === "login");
    const games = routes.find((route) => route.name === "competition-games");
    const adminImport = routes.find((route) => route.name === "admin-import");

    expect(home?.path).toBe("/");
    expect(home?.meta.access).toBe("public");

    expect(register?.path).toBe("/register");
    expect(register?.meta.access).toBe("public");

    expect(login?.path).toBe("/login");
    expect(login?.meta.access).toBe("public");

    expect(games?.path).toBe("/competitions/:competitionId/games");
    expect(games?.meta.access).toBe("authenticated");

    expect(adminImport?.path).toBe("/admin/import");
    expect(adminImport?.meta.access).toBe("admin");
  });

  it("redirects unauthenticated users from competition games to login", async () => {
    const router = createAppRouter(createMemoryHistory());

    await router.push("/competitions");

    expect(router.currentRoute.value.name).toBe("login");
  });

  it("redirects authenticated non-admin users from admin import to home", async () => {
    const router = createAppRouter(createMemoryHistory(), {
      isAuthenticated: true,
      isAdmin: false,
    });

    await router.push("/admin/import");

    expect(router.currentRoute.value.name).toBe("home");
  });

  it("uses the latest auth state when evaluating protected routes", async () => {
    let authState = {
      isAuthenticated: false,
      isAdmin: false,
    };

    const router = createAppRouter(createMemoryHistory(), () => authState);

    await router.push("/login");

    authState = {
      isAuthenticated: true,
      isAdmin: false,
    };

    await router.push("/competitions/competition-1/games");

    expect(router.currentRoute.value.name).toBe("competition-games");
  });

});
