// Maps a Clerk sign-in error to plain, actionable copy — never a raw
// Clerk error code/message (EXPERIENCE.md Voice and Tone: state what
// happened, no raw error surfaces). Kept separate from the form component
// so the mapping logic is unit-testable without mocking Clerk's network
// behavior.
//
// Clerk 7's SignIn Future API (signIn.password(), signIn.finalize(), etc.)
// resolves with `{ error: ClerkError | null }` rather than throwing — the
// error carries a stable machine-readable `code`, distinct from the older
// REST-style `{ errors: [...] }` array shape used by earlier Clerk SDKs.
interface ClerkErrorLike {
  code?: string;
}

function hasErrorCode(error: unknown): error is ClerkErrorLike {
  return typeof error === "object" && error !== null && "code" in error;
}

export function mapClerkSignInError(error: unknown): string {
  if (!hasErrorCode(error)) {
    return "Something went wrong signing you in. Please try again.";
  }

  switch (error.code) {
    case "form_password_incorrect":
    case "form_identifier_not_found":
      // Same message for both — never reveal whether the email exists.
      return "That email and password combination doesn't match our records.";
    case "too_many_requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong signing you in. Please try again.";
  }
}
