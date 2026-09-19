// Maps an /auth/login HTTP status to plain, actionable copy — never a raw
// status code or server error surfaces. Kept separate from the form/action
// so the mapping logic is unit-testable without mocking fetch.
export function mapLoginError(
  status: number | null,
  serverMessage?: string | null,
): string {
  if (status === 401) {
    // apps/api sends the deactivation 401 ONLY after the password matched
    // (see AuthService.login), so passing it through reveals nothing to an
    // attacker probing emails — and the account's real holder gets told to
    // contact the Owner instead of endlessly retrying passwords.
    if (serverMessage && /deactivated/i.test(serverMessage)) {
      return serverMessage;
    }
    // Same message whether the email doesn't exist or the password is
    // wrong — never reveal which one it was (no user enumeration).
    return "That email and password combination doesn't match our records.";
  }
  return "Something went wrong signing you in. Please try again.";
}
