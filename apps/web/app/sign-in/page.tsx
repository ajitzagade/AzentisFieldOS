"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Button, Card, TextField } from "@azentisfieldos/ui";
import { mapClerkSignInError } from "./map-clerk-error";

// Custom-styled sign-in flow using Clerk's headless useSignIn hook (the
// SignIn Future/signals API in this Clerk version — signIn.password()
// resolves with { error } rather than throwing) rather than the prebuilt
// <SignIn/> component — DESIGN.md's exact card layout (brand mark,
// tagline, single-tenant footer note) needs pixel-level control the
// prebuilt component's `appearance` theming doesn't cleanly give. Clerk
// still owns all credential verification and session issuance (AD-10);
// only the presentational layer here is custom.
export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: passwordError } = await signIn.password({ identifier: email, password });
      if (passwordError) {
        setError(mapClerkSignInError(passwordError));
        return;
      }

      if (signIn.status !== "complete") {
        // Single-tenant, single-factor sign-in (AD-1, AD-10) never expects
        // a further step (MFA, verification) — any non-"complete" status
        // here is treated the same as an error, never a raw status surfaced.
        setError("Something went wrong signing you in. Please try again.");
        return;
      }

      const { error: finalizeError } = await signIn.finalize({ navigate: () => router.push("/") });
      if (finalizeError) {
        setError(mapClerkSignInError(finalizeError));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent-navy-800 p-6">
      <Card className="w-full max-w-100">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-md bg-accent-teal-700 text-lg font-bold text-white">
            A
          </div>
          <div className="text-card-title text-ink-900">AzentisFieldOS</div>
        </div>
        <p className="mb-8 text-center text-body-sm text-ink-500">
          Field operations, accounted for — sites, stock and settlements in one system.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? (
            <p role="alert" className="mb-4 text-caption text-danger-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" isLoading={isSubmitting} className="w-full justify-center">
            Sign in
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-eyebrow text-ink-500">
          Single-tenant deployment for your organisation — no tenant selection required.
        </div>
      </Card>
    </div>
  );
}
