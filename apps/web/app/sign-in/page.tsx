"use client";

import { useActionState, useRef } from "react";
import { Button, Card, LockIcon, MailIcon, TextField } from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "../../lib/use-prevent-form-reset-on-error";
import { loginAction } from "./actions";
import { APP_DISPLAY_NAME } from "../../lib/tenant";

// Custom password sign-in posting to apps/api's own /auth/login via a
// Server Action (loginAction) — apps/api owns credential verification and
// session-token issuance directly (no third-party identity provider); this
// page is presentational only. Native <form action> + useActionState means
// the fields are plain uncontrolled inputs (name= is enough; the action
// reads them from FormData), and the token never touches client JS — the
// action sets it as an httpOnly cookie server-side before redirecting.
export default function SignInPage() {
  const [error, formAction, isPending] = useActionState(loginAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent-navy-800 p-6">
      <Card className="w-full max-w-100">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-md bg-accent-teal-700 text-lg font-bold text-white">
            {APP_DISPLAY_NAME[0]}
          </div>
          <div className="text-card-title text-ink-900">{APP_DISPLAY_NAME}</div>
        </div>
        <p className="mb-8 text-center text-body-sm text-ink-500">
          Field operations, accounted for — sites, stock and settlements in one system.
        </p>

        <form ref={formRef} action={formAction} noValidate>
          <TextField
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            icon={<MailIcon className="size-4" />}
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            icon={<LockIcon className="size-4" />}
          />

          {error ? (
            <p role="alert" className="mb-4 text-caption text-danger-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" isLoading={isPending} className="w-full justify-center">
            <LockIcon className="size-4" />
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
