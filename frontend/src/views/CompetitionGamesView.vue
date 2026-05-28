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

    <form
      class="mt-4 max-w-md rounded-md border border-slate-200 bg-white px-4 py-3"
      @submit.prevent="submitScoringRules"
    >
      <section class="mt-4 max-w-md rounded-md border border-slate-200 bg-white px-4 py-3">
        <h2 class="text-base font-semibold text-slate-900">Punkteschema</h2>

        <p v-if="isLoadingScoringRules" class="mt-3 text-sm text-slate-600">
          Punkteschema wird geladen.
        </p>

        <div v-else class="mt-3 space-y-3">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Exaktes Ergebnis</span>
            <input v-model="scoringExactScorePoints" type="number" min="0" step="1"
              class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Tordifferenz</span>
            <input v-model="scoringGoalDifferencePoints" type="number" min="0" step="1"
              class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Tendenz</span>
            <input v-model="scoringTendencyPoints" type="number" min="0" step="1"
              class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>

        <p v-if="scoringRulesSuccessMessage"
          class="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {{ scoringRulesSuccessMessage }}
        </p>

        <button type="submit"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          :disabled="isSavingScoringRules">
          Punkteschema speichern
        </button>

      </section>
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
            <th class="px-3 py-2 font-medium text-slate-700">Mein Tipp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in games" :key="game.id" class="border-b border-slate-100">
            <td class="px-3 py-2">{{ game.round.name }}</td>
            <td class="px-3 py-2">{{ game.homeTeam?.name ?? game.homeTeamPlaceholder ?? "Offen" }}</td>
            <td class="px-3 py-2">{{ game.awayTeam?.name ?? game.awayTeamPlaceholder ?? "Offen" }}</td>
            <td class="px-3 py-2">{{ formatBerlinDateTime(game.startsAt) }}</td>

            <td class="px-3 py-2">
              <form
                v-if="isGameTippable(game) && tipInputs[game.id]"
                class="flex items-center gap-2"
                @submit.prevent="submitTip(game)"
              >
                <input
                  v-model="tipInputs[game.id].homeGoals"
                  type="number"
                  min="0"
                  step="1"
                  class="w-16 rounded-md border border-slate-300 px-2 py-1"
                  aria-label="Heimtore tippen"
                />
                <span>:</span>
                <input
                  v-model="tipInputs[game.id].awayGoals"
                  type="number"
                  min="0"
                  step="1"
                  class="w-16 rounded-md border border-slate-300 px-2 py-1"
                  aria-label="Auswaertstore tippen"
                />
                <select
                  v-if="shouldAskAdvancingTeam(game)"
                  v-model="tipInputs[game.id].advancingTeamId"
                  class="rounded-md border border-slate-300 px-2 py-1"
                  aria-label="Weiterkommer tippen"
                >
                  <option value="">Weiterkommer</option>
                  <option v-if="game.homeTeam" :value="game.homeTeam.id">
                    {{ game.homeTeam.name }}
                  </option>
                  <option v-if="game.awayTeam" :value="game.awayTeam.id">
                    {{ game.awayTeam.name }}
                  </option>
                </select>
                <button
                  type="submit"
                  class="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
                  :disabled="tipInputs[game.id].isSaving"
                >
                  Speichern
                </button>
              </form>

              <span v-else-if="tipsByGameId[game.id]">
                {{ tipsByGameId[game.id].homeGoals }}:{{ tipsByGameId[game.id].awayGoals }}
                <span v-if="findTeamName(game, tipsByGameId[game.id].advancingTeamId)">
                  · {{ findTeamName(game, tipsByGameId[game.id].advancingTeamId) }}
                </span>
              </span>
              <span v-else class="text-slate-500">
                {{ getTipUnavailableReason(game) ?? "kein Tipp" }}
              </span>
            </td>
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
import { formatBerlinDateTime } from "../lib/format-berlin-date-time";
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
import { getCompetitionScoringRules } from "../api/get-competition-scoring-rules";
import { upsertCompetitionScoringRules } from "../api/upsert-competition-scoring-rules";
import {
  listMyCompetitionTips,
  type MyCompetitionTip,
} from "../api/list-my-competition-tips";
import { submitCompetitionGameTip } from "../api/submit-competition-game-tip";

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
const scoringExactScorePoints = ref("");
const scoringGoalDifferencePoints = ref("");
const scoringTendencyPoints = ref("");
const isLoadingScoringRules = ref(false);
const scoringRulesSuccessMessage = ref<string | null>(null);
const isSavingScoringRules = ref(false);
const games = ref<CompetitionGame[]>([]);
const isLoadingGames = ref(false);
const tips = ref<MyCompetitionTip[]>([]);
const isLoadingTips = ref(false);

type TipInput = {
  homeGoals: string;
  awayGoals: string;
  advancingTeamId: string;
  isSaving: boolean;
};
const tipInputs = ref<Record<string, TipInput>>({});

const tipsByGameId = computed(() =>
  Object.fromEntries(tips.value.map((tip) => [tip.gameId, tip])),
);
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

async function loadScoringRules(competitionId: string) {
  appStore.clearGlobalError();
  isLoadingScoringRules.value = true;

  try {
    const result = await getCompetitionScoringRules(competitionId);
    const values = result.scoringRules ?? result.defaultSuggestion;

    scoringExactScorePoints.value = String(values.exactScorePoints);
    scoringGoalDifferencePoints.value = String(values.goalDifferencePoints);
    scoringTendencyPoints.value = String(values.tendencyPoints);
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  } finally {
    isLoadingScoringRules.value = false;
  }
}

watch(
  () => route.params.competitionId,
  async (competitionId) => {
    selectedCompetitionId.value =
      typeof competitionId === "string" ? competitionId : "";

    if (!selectedCompetitionId.value) {
      games.value = [];
      tips.value = [];
      scoringExactScorePoints.value = "";
      scoringGoalDifferencePoints.value = "";
      scoringTendencyPoints.value = "";
      scoringRulesSuccessMessage.value = null;
      return;
    }

    await loadGames(selectedCompetitionId.value);
    await loadMyTips(selectedCompetitionId.value);

    if (authStore.isAdmin) {
      await loadScoringRules(selectedCompetitionId.value);
    }
  },
  {
    immediate: true,
  },
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

async function loadMyTips(competitionId: string) {
  appStore.clearGlobalError();
  isLoadingTips.value = true;

  try {
    const result = await listMyCompetitionTips(competitionId);
    tips.value = result.tips;
    syncTipInputs();
  } catch (error) {
    tips.value = [];

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
    isLoadingTips.value = false;
  }
}

function syncTipInputs() {
  tipInputs.value = Object.fromEntries(
    games.value.map((game) => {
      const tip = tipsByGameId.value[game.id];

      return [
        game.id,
        {
          homeGoals: tip ? String(tip.homeGoals) : "",
          awayGoals: tip ? String(tip.awayGoals) : "",
          advancingTeamId: tip?.advancingTeamId ?? "",
          isSaving: false,
        },
      ];
    }),
  );
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

function parseScoringRuleValue(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

async function submitScoringRules() {
  if (!selectedCompetition.value) {
    return;
  }

  scoringRulesSuccessMessage.value = null;
  appStore.clearGlobalError();

  const exactScorePoints = parseScoringRuleValue(scoringExactScorePoints.value);
  const goalDifferencePoints = parseScoringRuleValue(
    scoringGoalDifferencePoints.value,
  );
  const tendencyPoints = parseScoringRuleValue(scoringTendencyPoints.value);

  if (
    exactScorePoints === null ||
    goalDifferencePoints === null ||
    tendencyPoints === null
  ) {
    appStore.setGlobalError(
      "Das Punkteschema darf nur ganze Zahlen groesser oder gleich 0 enthalten.",
    );
    return;
  }

  isSavingScoringRules.value = true;

  try {
    const result = await upsertCompetitionScoringRules(
      selectedCompetition.value.id,
      {
        exactScorePoints,
        goalDifferencePoints,
        tendencyPoints,
      },
    );

    scoringExactScorePoints.value = String(result.scoringRules.exactScorePoints);
    scoringGoalDifferencePoints.value = String(
      result.scoringRules.goalDifferencePoints,
    );
    scoringTendencyPoints.value = String(result.scoringRules.tendencyPoints);
    scoringRulesSuccessMessage.value = "Punkteschema erfolgreich gespeichert.";
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  } finally {
    isSavingScoringRules.value = false;
  }
}

function parseGoalValue(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

function isGameTippable(game: CompetitionGame) {
  return Boolean(game.homeTeam && game.awayTeam && new Date(game.startsAt) > new Date());
}

async function submitTip(game: CompetitionGame) {
  if (!selectedCompetitionId.value) {
    return;
  }

  const input = tipInputs.value[game.id];

  if (!input) {
    return;
  }

  const homeGoals = parseGoalValue(input.homeGoals);
  const awayGoals = parseGoalValue(input.awayGoals);

  if (homeGoals === null || awayGoals === null) {
    appStore.setGlobalError("Bitte nicht-negative ganze Zahlen als Tipp eintragen.");
    return;
  }

  appStore.clearGlobalError();
  input.isSaving = true;

  const payload: {
    homeGoals: number;
    awayGoals: number;
    advancingTeamId?: string;
  } = {
    homeGoals,
    awayGoals,
  };

  if (shouldAskAdvancingTeam(game)) {
    if (!input.advancingTeamId) {
      appStore.setGlobalError("Bitte waehle bei einem K.o.-Unentschieden den Weiterkommer aus.");
      return;
    }

    payload.advancingTeamId = input.advancingTeamId;
  }

  try {
    const result = await submitCompetitionGameTip(selectedCompetitionId.value, game.id, payload);

    tips.value = [
      ...tips.value.filter((tip) => tip.gameId !== game.id),
      {
        gameId: result.tip.gameId,
        homeGoals: result.tip.homeGoals,
        awayGoals: result.tip.awayGoals,
        advancingTeamId: result.tip.advancingTeamId,
      },
    ];

    tipInputs.value[game.id] = {
      homeGoals: String(result.tip.homeGoals),
      awayGoals: String(result.tip.awayGoals),
      advancingTeamId: result.tip.advancingTeamId ?? "",
      isSaving: false,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      appStore.setGlobalErrorFromApiPayload(error.payload);
      return;
    }

    appStore.setGlobalError("Unbekannter Fehler");
  } finally {
    input.isSaving = false;
  }
}

function isKnockoutGame(game: CompetitionGame) {
  return game.group === null;
}

function shouldAskAdvancingTeam(game: CompetitionGame) {
  const input = tipInputs.value[game.id];

  if (!input || !isKnockoutGame(game)) {
    return false;
  }

  const homeGoals = parseGoalValue(input.homeGoals);
  const awayGoals = parseGoalValue(input.awayGoals);

  return homeGoals !== null && awayGoals !== null && homeGoals === awayGoals;
}

function findTeamName(game: CompetitionGame, teamId: string | null) {
  if (!teamId) {
    return null;
  }

  if (game.homeTeam?.id === teamId) {
    return game.homeTeam.name;
  }

  if (game.awayTeam?.id === teamId) {
    return game.awayTeam.name;
  }

  return null;
}

function getTipUnavailableReason(game: CompetitionGame) {
  if (!game.homeTeam || !game.awayTeam) {
    return "Teams stehen noch nicht fest";
  }

  if (new Date(game.startsAt) <= new Date()) {
    return "Anpfiff bereits erreicht";
  }

  return null;
}
</script>
