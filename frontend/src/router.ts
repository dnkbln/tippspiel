import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from "vue-router";

import HomeView from "./views/HomeView.vue";
import RegisterView from "./views/RegisterView.vue";
import LoginView from "./views/LoginView.vue";
import CompetitionGamesView from "./views/CompetitionGamesView.vue";
import AdminImportView from "./views/AdminImportView.vue";

type RouteAccess = "public" | "authenticated" | "admin";

type AuthState = {
  isAuthenticated: boolean;
  isAdmin: boolean;
};

type AuthStateSource = AuthState | (() => AuthState);

const guestAuthState: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
};

function resolveAuthState(source: AuthStateSource): AuthState {
  if (typeof source === "function") {
    return source();
  }

  return source;
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { access: "public" satisfies RouteAccess },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { access: "public" satisfies RouteAccess },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { access: "public" satisfies RouteAccess },
  },
  {
    path: "/competitions/:competitionId/games",
    name: "competition-games",
    component: CompetitionGamesView,
    meta: { access: "authenticated" satisfies RouteAccess },
  },
  {
    path: "/admin/import",
    name: "admin-import",
    component: AdminImportView,
    meta: { access: "admin" satisfies RouteAccess },
  },
];

export function createAppRouter(
  history: RouterHistory,
  authStateSource: AuthStateSource = guestAuthState,
) {
  const router = createRouter({
    history,
    routes,
  });

  router.beforeEach((to) => {
    const access = to.meta.access as RouteAccess | undefined;
    const authState = resolveAuthState(authStateSource);

    if (!access || access === "public") {
      return true;
    }

    if (!authState.isAuthenticated) {
      return { name: "login" };
    }

    if (access === "admin" && !authState.isAdmin) {
      return { name: "home" };
    }

    return true;
  });

  return router;
}

export function createBrowserRouter(authStateSource?: AuthStateSource) {
  return createAppRouter(createWebHistory(), authStateSource);
}

export { createMemoryHistory };
export type { AuthState };
