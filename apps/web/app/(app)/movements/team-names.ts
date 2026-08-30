import { authedFetch } from "@/lib/api";

// Active Team Member names for the Receiver / Person Responsible datalists
// — suggestions only (the field stays free text, and a typed name is never
// added to the Team roster). A failed read degrades to an empty list so the
// form itself never blocks on it.
export async function getTeamNames(): Promise<string[]> {
  try {
    const res = await authedFetch(`/team-members`, { cache: "no-store" });
    if (!res.ok) return [];
    const members = (await res.json()) as { name: string; isActive?: boolean }[];
    return Array.isArray(members)
      ? members.filter((m) => m.isActive !== false).map((m) => m.name)
      : [];
  } catch {
    return [];
  }
}
