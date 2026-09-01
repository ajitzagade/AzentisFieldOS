"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { Card, ClipboardIcon, SearchIcon } from "@azentisfieldos/ui";

// Help & Guides landing page (EXPERIENCE.md: "What do you want help with?").
// Reads the same HELP_CONTENT the Client Presentation is generated from —
// a guide added once appears in both places, never authored twice.
const SECTIONS: { label: string; moduleIds: string[] }[] = [
  { label: "Getting Started", moduleIds: ["dashboard"] },
  { label: "Sites", moduleIds: ["sites", "site-detail"] },
  { label: "Materials", moduleIds: ["materials", "inventory", "purchases", "movements", "consumption"] },
  { label: "Labour", moduleIds: ["team", "advances", "payments"] },
  { label: "Daily Report", moduleIds: ["dsr"] },
  { label: "Owner", moduleIds: ["reports", "vendors", "waste-disposal"] },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return HELP_CONTENT.guides.filter(
      (g) => g.title.toLowerCase().includes(q) || g.result.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Help &amp; Guides</h1>
        <p className="text-body-sm text-ink-500">Short, visual guides for everyday tasks — no technical knowledge needed.</p>
      </div>

      <div className="relative mb-8 max-w-160">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want help with? e.g. &quot;record material used&quot;"
          className="w-full rounded-md border border-border-strong bg-surface-1 py-3 pr-4 pl-10 text-body text-ink-900 focus:border-accent-teal-700 focus:ring-3 focus:ring-accent-teal-100 focus:outline-none"
        />
      </div>

      {results ? (
        <>
          <h2 className="mb-3 text-section-header text-ink-900">
            {results.length === 0 ? "No matching guides" : `${results.length} guide${results.length === 1 ? "" : "s"} found`}
          </h2>
          {results.length === 0 ? (
            <p className="text-body-sm text-ink-500">
              Try a different search, or browse a section below — Sites, Materials, Labour, Daily Report, Owner.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((g) => (
                <GuideCard key={g.id} id={g.id} title={g.title} result={g.result} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <Card key={section.label}>
              <h3 className="mb-3 text-card-title text-ink-900">{section.label}</h3>
              <ul className="flex flex-col gap-2">
                {section.moduleIds.map((id) => {
                  const m = HELP_CONTENT.modules.find((mod) => mod.id === id);
                  if (!m) return null;
                  const guide = HELP_CONTENT.guides.find((g) => g.moduleId === id);
                  return (
                    <li key={id}>
                      <Link
                        href={guide ? `/help/${guide.id}` : m.href}
                        className="flex items-center gap-2 text-body-sm text-accent-teal-700 hover:underline"
                      >
                        <ClipboardIcon className="size-3.5 shrink-0" />
                        {m.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-12 mb-3 text-section-header text-ink-900">All guides</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_CONTENT.guides.map((g) => (
          <GuideCard key={g.id} id={g.id} title={g.title} result={g.result} />
        ))}
      </div>
    </>
  );
}

function GuideCard({ id, title, result }: { id: string; title: string; result: string }) {
  return (
    <Link href={`/help/${id}`} className="block">
      <Card interactive className="h-full">
        <h3 className="mb-1 text-body font-semibold text-ink-900">{title}</h3>
        <p className="text-caption text-ink-500">{result}</p>
      </Card>
    </Link>
  );
}
