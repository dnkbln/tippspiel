<template>
  <div class="min-h-screen bg-stone-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <nav
        aria-label="Hauptnavigation"
        class="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4"
      >
        <router-link
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="text-sm font-medium text-slate-700 hover:text-slate-950"
        >
          {{ item.label }}
        </router-link>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="ml-auto rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          @click="submitLogout"
        >
          Abmelden
        </button>
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-8">
      <p
        v-if="appStore.globalError"
        role="alert"
        class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        {{ appStore.globalError }}
      </p>

      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

import { logoutUser } from "./api/logout-user";
import { getNavigationItems } from "./navigation";
import { useAppStore } from "./stores/app";
import { useAuthStore } from "./stores/auth";

const appStore = useAppStore();
const authStore = useAuthStore();
const router = useRouter();

const navigationItems = computed(() =>
  getNavigationItems({
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
  }),
);

async function submitLogout() {
  appStore.clearGlobalError();

  try {
    await logoutUser();
  } catch {
    appStore.setGlobalError("Abmeldung konnte serverseitig nicht bestaetigt werden.");
  } finally {
    authStore.clearRole();
    await router.push("/");
  }
}
</script>
