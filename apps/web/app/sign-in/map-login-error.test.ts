import { describe, expect, it } from "vitest";
import { mapLoginError } from "./map-login-error";

describe("mapLoginError", () => {
  it("maps a 401 (unknown email or wrong password) to a friendly, actionable message", () => {
    expect(mapLoginError(401)).toBe(
      "That email and password combination doesn't match our records.",
    );
  });

  it("passes the deactivated-account 401 message through (sent only after the password matched, so no enumeration risk)", () => {
    expect(
      mapLoginError(401, "This account has been deactivated. Contact your administrator."),
    ).toBe("This account has been deactivated. Contact your administrator.");
  });

  it("keeps the generic 401 copy for any other server message (never leaks raw server text)", () => {
    expect(mapLoginError(401, "Invalid email or password.")).toBe(
      "That email and password combination doesn't match our records.",
    );
    expect(mapLoginError(401, null)).toBe(
      "That email and password combination doesn't match our records.",
    );
  });

  it("falls back to a generic message for any other status code", () => {
    expect(mapLoginError(500)).toBe(
      "Something went wrong signing you in. Please try again.",
    );
    expect(mapLoginError(400)).toBe(
      "Something went wrong signing you in. Please try again.",
    );
  });

  it("falls back to a generic message when there is no status at all (network failure)", () => {
    expect(mapLoginError(null)).toBe(
      "Something went wrong signing you in. Please try again.",
    );
  });
});
