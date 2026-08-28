"use client";

import { AlertTriangleIcon, Button, Card } from "@azentisfieldos/ui";

// Route-group error boundary for every sidebar-navigable page (AD-6: a
// failed server fetch must land on a designed error state with a retry,
// not Next's unstyled crash screen). The shell/layout above this boundary
// keeps rendering, so the user keeps their navigation.
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="mx-auto mt-10 flex max-w-100 flex-col items-center gap-3 p-8 text-center">
      <AlertTriangleIcon className="size-8 text-danger-700" />
      <h1 className="text-card-title text-ink-900">Something went wrong loading this page</h1>
      <p className="text-body-sm text-ink-500">
        The data couldn&apos;t be loaded — it may be a connection problem. Your recorded data is safe.
      </p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
