export async function logoutUser(): Promise<void> {
  await fetch("/auth/logout", {
    method: "POST",
  });
}
