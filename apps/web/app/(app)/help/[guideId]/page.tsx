import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { CheckCircleIcon, buttonVariants, cn } from "@azentisfieldos/ui";

// One visual step-by-step guide (EXPERIENCE.md Component Patterns → Guide
// step / Guide content source) — numbered cards read straight from
// HELP_CONTENT.guides, the same data the Client Presentation is generated
// from. The final step is always a real "Try it yourself" link into the
// live page it just taught (story 15.5-adjacent decision, confirmed with
// the Owner: a real link now, not a guided overlay).
export default async function GuidePage({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
  const guide = HELP_CONTENT.guides.find((g) => g.id === guideId);
  if (!guide) {
    notFound();
  }
  const guideModule = HELP_CONTENT.modules.find((m) => m.id === guide.moduleId);

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/help" className="hover:text-accent-teal-700 hover:underline">
          Help &amp; Guides
        </Link>{" "}
        / {guide.title}
      </div>
      <h1 className="mb-2 text-page-title text-ink-900">{guide.title}</h1>
      {guideModule ? <p className="mb-6 text-body-sm text-ink-500">{guideModule.whatIsIt}</p> : null}

      <ol className="flex flex-col gap-3">
        {guide.steps.map((step, i) => (
          <li
            key={step.title}
            className="flex items-start gap-4 rounded-lg border border-border-hairline bg-surface-1 p-4 shadow-1"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-teal-700 text-body-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <div className="text-card-title text-ink-900">{step.title}</div>
              <p className="mt-0.5 text-body-sm text-ink-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-2 rounded-md bg-success-100 p-3 text-body-sm font-semibold text-success-700">
        <CheckCircleIcon className="size-5 shrink-0" />
        {guide.result}
      </div>

      <Link href={guide.tryItHref} className={cn(buttonVariants({ variant: "primary" }), "mt-6")}>
        Try it yourself
      </Link>

      {guideModule ? (
        <div className="mt-10 rounded-lg border border-border-hairline bg-surface-2 p-5">
          <div className="mb-1 text-eyebrow uppercase text-ink-500">Real-life example</div>
          <p className="text-body-sm text-ink-700">{guideModule.example}</p>
        </div>
      ) : null}
    </div>
  );
}
