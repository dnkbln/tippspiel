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
        class="mt-1 block w-full h-10 cursor-pointer appearance-auto rounded-md border border-slate-300 bg-white px-3 py-2"
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

    <form
      v-if="authStore.isAdmin && selectedCompetition"
      class="mt-4 max-w-md rounded-md border border-slate-200 bg-white px-4 py-3"
      @submit.prevent="submitCompetitionRename"
    >
      <label class="block">
        <span class="text-sm font-medium text-slate-700">Competition-Name</span>
        <input
          v-model="newCompetitionName"
          type="text"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        class="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        :disabled="isUpdatingCompetition"
      >
        Name speichern
      </button>
      <div class="mt-4 border-t border-slate-200 pt-4">
        <button
          type="button"
          class="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          :disabled="isDeletingCompetition"
          @click="submitCompetitionDelete"
        >
          Competition loeschen
        </button>
      </div>
    </form>

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
import { computed, onMounted, ref, watch } from "vue";
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
import { updateCompetition } from "../api/update-competition";
import { deleteCompetition } from "../api/delete-competition";

const appStore = useAppStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const competitions = ref<Competition[]>([]);
const selectedCompetitionId = ref(
  typeof route.params.competitionId === "string" ? route.params.competitionId : "",
);
const isLoadingCompetitions = ref(false);
const newCompetitionName = ref("");
const isUpdatingCompetition = ref(false);
const isDeletingCompetition = ref(false);

const selectedCompetition = computed(() =>
  competitions.value.find(
    (competition) => competition.id === selectedCompetitionId.value,
  ) ?? null,
);

watch(selectedCompetition, (competition) => {
  newCompetitionName.value = competition?.name ?? "";
});

onMounted(loadCompetitions);

async function loadCompetitions() {
  appStore.clearGlobalError();
  isLoadingCompetitions.value = true;

  try {
    const result = await listCompetitions();
    competitions.value = result.competitions;
    if (!selectedCompetitionId.value && result.competitions.length === 1) {
      selectedCompetitionId.value = result.competitions[0].id;
      await router.push(`/competitions/${selectedCompetitionId.value}/games`);
    }

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

async function submitCompetitionRename() {
  if (!selectedCompetition.value) {
    return;
  }

  appStore.clearGlobalError();
  isUpdatingCompetition.value = true;

  try {
    const result = await updateCompetition(selectedCompetition.value.id, {
      name: newCompetitionName.value,
    });

    competitions.value = competitions.value.map((competition) =>
      competition.id === result.competition.id ? result.competition : competition,
    );

    newCompetitionName.value = result.competition.name;
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  } finally {
    isUpdatingCompetition.value = false;
  }
}

async function submitCompetitionDelete() {
  const competition = selectedCompetition.value;

  if (!competition) {
    return;
  }

  const confirmed = window.confirm(
    `Competition "${competition.name}" wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.`,
  );

  if (!confirmed) {
    return;
  }

  appStore.clearGlobalError();
  isDeletingCompetition.value = true;

  try {
    await deleteCompetition(competition.id);

    competitions.value = competitions.value.filter(
      (candidate) => candidate.id !== competition.id,
    );

    if (selectedCompetitionId.value === competition.id) {
      selectedCompetitionId.value = "";
      games.value = [];
      newCompetitionName.value = "";
      await router.push("/competitions");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  } finally {
    isDeletingCompetition.value = false;
  }
}

</script>

