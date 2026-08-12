import { notFound } from "next/navigation";
import { EditSiteForm } from "./edit-site-form";
import type { Site } from "../../page";

// No GET /sites/:id endpoint exists yet (that's story 2.3's job) — fetch
// the list and find by id as an interim approach scoped to this story
// alone. Do not add a dedicated endpoint here just to make this cleaner;
// that would duplicate 2.3's work ahead of it.
async function getSite(id: string): Promise<Site | undefined> {
  const res = await fetch(`${process.env.API_URL}/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load sites (${res.status})`);
  }
  const sites: Site[] = await res.json();
  return sites.find((site) => site.id === id);
}

export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getSite(id);

  if (!site) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Site</h1>
      <EditSiteForm site={site} />
    </div>
  );
}
