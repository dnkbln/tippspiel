<template>
  <section>
    <h1 class="text-2xl font-semibold">Registrierung</h1>

    <p
      v-if="successMessage"
      class="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMessage }}
    </p>

    <form
      class="mt-6 max-w-md space-y-4"
      @submit.prevent="submitRegistration"
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
        <span class="text-sm font-medium text-slate-700">Anzeigename</span>
        <input
          v-model="form.displayName"
          name="displayName"
          type="text"
          autocomplete="nickname"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Passwort</span>
        <input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Einladungscode</span>
        <input
          v-model="form.invitationCode"
          name="invitationCode"
          type="text"
          autocomplete="off"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Konto anlegen
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

import { ApiError, registerUser } from "../api/register-user";
import { useAppStore } from "../stores/app";

const appStore = useAppStore();
const successMessage = ref<string | null>(null);
const form = reactive({
  email: "",
  displayName: "",
  password: "",
  invitationCode: "",
});

async function submitRegistration() {
  successMessage.value = null;
  appStore.clearGlobalError();

  try {
    await registerUser({
      email: form.email,
      displayName: form.displayName,
      password: form.password,
      invitationCode: form.invitationCode,
    });

    successMessage.value = "Registrierung erfolgreich.";
    form.email = "";
    form.displayName = "";
    form.password = "";
    form.invitationCode = "";
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  }
}

</script>
