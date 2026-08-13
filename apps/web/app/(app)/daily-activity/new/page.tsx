import Link from "next/link";
import { DsrDesktopForm } from "../_components/dsr-desktop-form";

// AC #1: reuses Story 3.1's POST /dsr endpoint via DsrDesktopForm — not a
// parallel one.
export default function NewDsrDesktopPage() {
  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/daily-activity" className="hover:text-accent-teal-700 hover:underline">
          Daily Activity
        </Link>{" "}
        / New
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">New Daily Activity</h1>

      <DsrDesktopForm mode="new" />
    </>
  );
}
