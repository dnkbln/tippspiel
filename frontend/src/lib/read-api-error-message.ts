export function readApiErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Unbekannter Fehler";
  }

  const candidate = payload as {
    error?: {
      message?: unknown;
    };
  };

  if (typeof candidate.error?.message === "string" && candidate.error.message) {
    return candidate.error.message;
  }

  return "Unbekannter Fehler";
}
