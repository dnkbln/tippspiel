import { describe, expect, it } from "vitest";

import { getNavigationItems } from "../src/navigation";

describe("getNavigationItems", () => {
  it("returns only public navigation items for guests", () => {
    expect(
      getNavigationItems({
        isAuthenticated: false,
        isAdmin: false,
      }),
    ).toEqual([
      { label: "Startseite", to: "/" },
      { label: "Registrierung", to: "/register" },
      { label: "Anmeldung", to: "/login" },
    ]);
  });

  it("returns user navigation items for authenticated non-admin users", () => {
    expect(
      getNavigationItems({
        isAuthenticated: true,
        isAdmin: false,
      }),
    ).toEqual([
      { label: "Startseite", to: "/" },
      { label: "Spielliste", to: "/competitions" },
    ]);
  });

  it("returns admin navigation items for authenticated admins", () => {
    expect(
      getNavigationItems({
        isAuthenticated: true,
        isAdmin: true,
      }),
    ).toEqual([
      { label: "Startseite", to: "/" },
      { label: "Spielliste", to: "/competitions" },
      { label: "Admin-Import", to: "/admin/import" },
    ]);
  });

});
