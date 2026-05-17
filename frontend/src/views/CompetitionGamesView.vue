<template>
  <section>
    <h1 class="text-2xl font-semibold">Spielliste</h1>

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
        class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"
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
    <p v-if="selectedCompetitionId && isLoadingGames" class="mt-4 text-sm text-slate-600">
      Spiele werden geladen.
    </p>

    <p
      v-else-if="selectedCompetitionId && games.length === 0"
      class="mt-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
    >
      Fuer diesen Wettbewerb sind noch keine Spiele vorhanden.
    </p>

    <div v-else-if="games.length > 0" class="mt-6 overflow-x-auto">
      <table class="w-full border-collapse bg-white text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left">
            <th class="px-3 py-2 font-medium text-slate-700">Runde</th>
            <th class="px-3 py-2 font-medium text-slate-700">Heimteam</th>
            <th class="px-3 py-2 font-medium text-slate-700">Auswaertsteam</th>
            <th class="px-3 py-2 font-medium text-slate-700">Anstosszeit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in games" :key="game.id" class="border-b border-slate-100">
            <td class="px-3 py-2">{{ game.round.name }}</td>
            <td class="px-3 py-2">{{ game.homeTeam?.name ?? game.homeTeamPlaceholder ?? "Offen" }}</td>
            <td class="px-3 py-2">{{ game.awayTeam?.name ?? game.awayTeamPlaceholder ?? "Offen" }}</td>
            <td class="px-3 py-2">{{ game.startsAt }}</td>
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
  listCompetitionGames,
  type CompetitionGame,
} from "../api/list-competition-games";
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

onMounted(loadCompetitions);

async function loadCompetitions() {
  appStore.clearGlobalError();
  isLoadingCompetitions.value = true;

  try {
    const result = await listCompetitions();
    competitions.value = result.competitions;
  } catch (error) {
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
  } finally {
    isLoadingCompetitions.value = false;
  }
}

async function selectCompetition() {
  if (!selectedCompetitionId.value) {
    await router.push("/competitions");
    return;
  }

  await router.push(`/competitions/${selectedCompetitionId.value}/games`);
}

const games = ref<CompetitionGame[]>([]);
const isLoadingGames = ref(false);

watch(
  () => route.params.competitionId,
  async (competitionId) => {
    selectedCompetitionId.value =
      typeof competitionId === "string" ? competitionId : "";

    if (!selectedCompetitionId.value) {
      games.value = [];
      return;
    }

    await loadGames(selectedCompetitionId.value);
  },
  { immediate: true },
);

async function loadGames(competitionId: string) {
  appStore.clearGlobalError();
  isLoadingGames.value = true;

  try {
    const result = await listCompetitionGames(competitionId);
    games.value = result.games;
  } catch (error) {
    games.value = [];

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
  } finally {
    isLoadingGames.value = false;
  }
}

</script>

