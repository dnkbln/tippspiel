import type { AuthState } from "./router";

type NavigationItem = {
  label: string;
  to: string;
};

export function getNavigationItems(authState: AuthState): NavigationItem[] {
  const items: NavigationItem[] = [{ label: "Startseite", to: "/" }];

  if (!authState.isAuthenticated) {
    items.push({ label: "Registrierung", to: "/register" });
    items.push({ label: "Anmeldung", to: "/login" });

    return items;
  }

  items.push({ label: "Spielliste", to: "/competitions/demo/games" });

  if (authState.isAdmin) {
    items.push({ label: "Admin-Import", to: "/admin/import" });
  }

  return items;
}
