<template>
  <section>
    <h1 class="text-2xl font-semibold">Rangliste</h1>

    <p v-if="isLoadingCompetitions" class="mt-4 text-sm text-slate-600">
      Wettbewerbe werden geladen.
    </p>

    <p
      v-else-if="competitions.length === 0"
      class="mt-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
    >
      Es sind noch keine Wettbewerbe vorhanden.
    </p>

    <label v-else class="mt-6 block max-w-md">
      <span class="text-sm font-medium text-slate-700">Wettbewerb</span>
      <select
        v-model="selectedCompetitionId"
        class="mt-1 block h-10 w-full cursor-pointer appearance-auto rounded-md border border-slate-300 bg-white px-3 py-2"
        @change="selectCompetition"
      >
        <option value="">Bitte auswaehlen</option>
        <option
          v-for="competition in competitions"
          :key="competition.id"
          :value="competition.id"
        >
          {{ competition.name }}
        </option>
      </select>
    </label>

    <p
      v-if="selectedCompetitionId && isLoadingLeaderboard"
      class="mt-4 text-sm text-slate-600"
    >
      Rangliste wird geladen.
    </p>

    <p
      v-else-if="selectedCompetitionId && leaderboard.length === 0"
      class="mt-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
    >
      Fuer diesen Wettbewerb sind noch keine Punkte vorhanden.
    </p>

    <div v-else-if="leaderboard.length > 0" class="mt-6 overflow-x-auto">
      <table class="w-full border-collapse bg-white text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left">
            <th class="px-3 py-2 font-medium text-slate-700">Platz</th>
            <th class="px-3 py-2 font-medium text-slate-700">Name</th>
            <th class="px-3 py-2 font-medium text-slate-700">Punkte</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in leaderboard"
            :key="entry.user.id"
            class="border-b border-slate-100"
          >
            <td class="px-3 py-2">{{ entry.rank }}</td>
            <td class="px-3 py-2">{{ entry.user.displayName }}</td>
            <td class="px-3 py-2">{{ entry.totalPoints }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ApiError } from "../api/register-user";
import {
  listCompetitions,
  type Competition,
} from "../api/list-competitions";
import {
  getCompetitionLeaderboard,
  type CompetitionLeaderboardEntry,
} from "../api/get-competition-leaderboard";
import { useAppStore } from "../stores/app";
import { useAuthStore } from "../stores/auth";

const appStore = useAppStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const competitions = ref<Competition[]>([]);
const selectedCompetitionId = ref(
  typeof route.params.competitionId === "string" ? route.params.competitionId : "",
);
const isLoadingCompetitions = ref(false);
const leaderboard = ref<CompetitionLeaderboardEntry[]>([]);
const isLoadingLeaderboard = ref(false);

onMounted(loadCompetitions);

watch(
  () => route.params.competitionId,
  async (competitionId) => {
    selectedCompetitionId.value =
      typeof competitionId === "string" ? competitionId : "";

    if (!selectedCompetitionId.value) {
      leaderboard.value = [];
      return;
    }

    await loadLeaderboard(selectedCompetitionId.value);
  },
  { immediate: true },
);

async function loadCompetitions() {
  appStore.clearGlobalError();
  isLoadingCompetitions.value = true;

  try {
    const result = await listCompetitions();
    competitions.value = result.competitions;

    if (!selectedCompetitionId.value && result.competitions.length === 1) {
      selectedCompetitionId.value = result.competitions[0].id;
      await router.push(`/competitions/${selectedCompetitionId.value}/leaderboard`);
    }
  } catch (error) {
    await handleApiError(error);
  } finally {
    isLoadingCompetitions.value = false;
  }
}

async function selectCompetition() {
  if (!selectedCompetitionId.value) {
    await router.push("/leaderboard");
    return;
  }

  await router.push(`/competitions/${selectedCompetitionId.value}/leaderboard`);
}

async function loadLeaderboard(competitionId: string) {
  appStore.clearGlobalError();
  isLoadingLeaderboard.value = true;

  try {
    const result = await getCompetitionLeaderboard(competitionId);
    leaderboard.value = result.leaderboard;
  } catch (error) {
    leaderboard.value = [];
    await handleApiError(error);
  } finally {
    isLoadingLeaderboard.value = false;
  }
}

async function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      authStore.clearRole();
      await router.push("/login");
      return;
    }

    appStore.setGlobalErrorFromApiPayload(error.payload);
    return;
  }

  appStore.setGlobalError("Unbekannter Fehler");
}
</script>