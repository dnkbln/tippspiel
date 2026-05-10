import { readApiErrorMessage } from "../lib/read-api-error-message";

export type RegisterUserPayload = {
  email: string;
  displayName: string;
  password: string;
  invitationCode: string;
};

export type RegisterUserResponse = {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: "USER" | "ADMIN";
  };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(readApiErrorMessage(payload));
  }
}

export async function registerUser(
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> {
  const response = await fetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(response.status, responsePayload);
  }

  return responsePayload as RegisterUserResponse;
}
