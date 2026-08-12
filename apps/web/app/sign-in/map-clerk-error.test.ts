import { describe, expect, it } from "vitest";
import { mapClerkSignInError } from "./map-clerk-error";

describe("mapClerkSignInError", () => {
  it("maps an incorrect password to a friendly, actionable message", () => {
    const error = { code: "form_password_incorrect" };
    expect(mapClerkSignInError(error)).toBe(
      "That email and password combination doesn't match our records.",
    );
  });

  it("maps an unknown identifier to the same message as an incorrect password (no user enumeration)", () => {
    const error = { code: "form_identifier_not_found" };
    expect(mapClerkSignInError(error)).toBe(
      "That email and password combination doesn't match our records.",
    );
  });

  it("maps a rate-limit error to a plain retry message", () => {
    const error = { code: "too_many_requests" };
    expect(mapClerkSignInError(error)).toBe("Too many attempts. Please wait a moment and try again.");
  });

  it("falls back to a generic message for an unrecognized Clerk error code", () => {
    const error = { code: "some_new_clerk_error_code" };
    expect(mapClerkSignInError(error)).toBe("Something went wrong signing you in. Please try again.");
  });

  it("falls back to a generic message for a non-Clerk error shape, never surfacing it raw", () => {
    expect(mapClerkSignInError(new Error("ECONNRESET"))).toBe(
      "Something went wrong signing you in. Please try again.",
    );
    expect(mapClerkSignInError("a raw string")).toBe(
      "Something went wrong signing you in. Please try again.",
    );
    expect(mapClerkSignInError(undefined)).toBe(
      "Something went wrong signing you in. Please try again.",
    );
  });
});
