// frontend/src/api/import-tournament-schedule.ts
import { ApiError } from "./register-user";

export async function importTournamentSchedule(payload: unknown): Promise<void> {
  const response = await fetch("/admin/import/tournament-schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responsePayload = (await response.json()) as unknown;
    throw new ApiError(response.status, responsePayload);
  }
}
