import { ApiError } from "./register-user";

export type LoginUserPayload = {
  email: string;
  password: string;
};

export type LoginUserResponse = {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: "USER" | "ADMIN";
  };
};

export async function loginUser(
  payload: LoginUserPayload,
): Promise<LoginUserResponse> {
  const response = await fetch("/auth/login", {
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

  return responsePayload as LoginUserResponse;
}
