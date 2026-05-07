export function readSessionToken(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");

    if (name === "session" && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}
