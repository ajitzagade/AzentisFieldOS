import type { Metadata } from "next";
import { Card, WifiOffIcon } from "@azentisfieldos/ui";
import { APP_DISPLAY_NAME } from "../../lib/tenant";

// Static offline fallback served by the service worker (public/sw.js) when a
// navigation fails offline. No data fetching, no auth — it must render from the
// SW precache alone. Design-token styled via the shared Card + icon (AD-4/AD-5);
// glossary tone: reassure the field user their queued work is safe.
export const metadata: Metadata = {
  title: `Offline — ${APP_DISPLAY_NAME}`,
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-surface-0 px-6 py-16">
      <Card className="w-full max-w-md text-center">
        <div className="mb-4 flex justify-center text-accent-teal-700 [&>svg]:size-12">
          <WifiOffIcon aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-ink-900">You&rsquo;re offline</h1>
        <p className="mt-2 text-sm text-ink-500">
          {APP_DISPLAY_NAME} can&rsquo;t reach the network right now. Check your
          connection and try again.
        </p>
        <p className="mt-4 text-sm text-ink-700">
          Anything you&rsquo;ve already submitted is saved on this device and will
          sync automatically once you&rsquo;re back online.
        </p>
      </Card>
    </main>
  );
}
