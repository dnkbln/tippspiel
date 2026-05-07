import { describe, expect, it } from "vitest";
import { readSessionToken } from "../../../src/routes/auth/read-session-token.js";

describe("readSessionToken", () => {
  it("returns the session token from the cookie header", () => {
    expect(readSessionToken("foo=bar; session=session-token; theme=light")).toBe(
      "session-token",
    );
  });

  it("decodes the session token", () => {
    expect(readSessionToken("session=session%20token")).toBe("session token");
  });

  it("returns null when the session cookie is missing", () => {
    expect(readSessionToken("foo=bar; theme=light")).toBeNull();
  });

  it("returns null when no cookie header is provided", () => {
    expect(readSessionToken(undefined)).toBeNull();
  });
});
