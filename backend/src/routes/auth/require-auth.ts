import { AppError } from "../../errors/app-error.js";
import { getAuthenticatedUser } from "../../services/get-authenticated-user.js";
import { readSessionToken } from "./read-session-token.js";

type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
};

type RequestLike = {
  headers: {
    cookie?: string;
  };
};

export async function requireAuth(
  request: RequestLike,
): Promise<AuthenticatedUser> {
  const sessionToken = readSessionToken(request.headers.cookie);
  const user = await getAuthenticatedUser(sessionToken);

  if (!user) {
    throw new AppError("UNAUTHORIZED", 401, "authentication required");
  }

  return user;
}
