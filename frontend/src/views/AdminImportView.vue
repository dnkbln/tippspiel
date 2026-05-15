<template>
  <section>
    <h1 class="text-2xl font-semibold">Spielplan importieren</h1>

    <p
      v-if="successMessage"
      class="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMessage }}
    </p>

    <form
      class="mt-6 max-w-3xl space-y-4"
      @submit.prevent="submitImport"
    >
      <label class="block">
        <span class="text-sm font-medium text-slate-700">JSON-Payload</span>
        <textarea
          v-model="jsonPayload"
          name="schedulePayload"
          rows="18"
          spellcheck="false"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
        />
      </label>

      <button
        type="submit"
        class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Spielplan importieren
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { importTournamentSchedule } from "../api/import-tournament-schedule";
import { ApiError } from "../api/register-user";
import { useAppStore } from "../stores/app";

const appStore = useAppStore();

const successMessage = ref<string | null>(null);
const jsonPayload = ref("");

async function submitImport() {
  successMessage.value = null;
  appStore.clearGlobalError();

  let payload: unknown;

  try {
    payload = JSON.parse(jsonPayload.value);
  } catch {
    appStore.setGlobalError("Der JSON-Payload ist ungueltig.");
    return;
  }

  try {
    await importTournamentSchedule(payload);
    successMessage.value = "Spielplan erfolgreich importiert.";
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  }
}
</script>
