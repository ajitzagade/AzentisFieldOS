// Maps an /auth/login HTTP status to plain, actionable copy — never a raw
// status code or server error surfaces. Kept separate from the form/action
// so the mapping logic is unit-testable without mocking fetch.
export function mapLoginError(status: number | null): string {
  if (status === 401) {
    // Same message whether the email doesn't exist or the password is
    // wrong — never reveal which one it was (no user enumeration).
    return "That email and password combination doesn't match our records.";
  }
  return "Something went wrong signing you in. Please try again.";
}
