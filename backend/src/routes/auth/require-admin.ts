import { AppError } from "../../errors/app-error.js";
import { requireAuth } from "./require-auth.js";

type RequestLike = {
  headers: {
    cookie?: string;
  };
};

export async function requireAdmin(request: RequestLike) {
  const user = await requireAuth(request);

  if (user.role !== "ADMIN") {
    throw new AppError("FORBIDDEN", 403, "admin access required");
  }

  return user;
}
