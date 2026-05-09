import { defineStore } from "pinia";

import { readApiErrorMessage } from "../lib/read-api-error-message";

export const useAppStore = defineStore("app", {
  state: () => ({
    title: "Tippspiel",
    globalError: null as string | null,
  }),
  actions: {
    setGlobalError(message: string) {
      this.globalError = message;
    },
    setGlobalErrorFromApiPayload(payload: unknown) {
      this.globalError = readApiErrorMessage(payload);
    },
    clearGlobalError() {
      this.globalError = null;
    },
  },
});
