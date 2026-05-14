<template>
  <section>
    <h1 class="text-2xl font-semibold">Anmeldung</h1>

    <form
      class="mt-6 max-w-md space-y-4"
      @submit.prevent="submitLogin"
    >
      <label class="block">
        <span class="text-sm font-medium text-slate-700">E-Mail</span>
        <input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Passwort</span>
        <input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="current-password"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Anmelden
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";

import { loginUser } from "../api/login-user";
import { ApiError } from "../api/register-user";
import { useAppStore } from "../stores/app";
import { useAuthStore } from "../stores/auth";

const appStore = useAppStore();
const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

async function submitLogin() {
  appStore.clearGlobalError();

  try {
    const result = await loginUser({
      email: form.email,
      password: form.password,
    });

    authStore.setRole(result.user.role);
    form.password = "";

    await router.push("/");
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  }
}
</script>

