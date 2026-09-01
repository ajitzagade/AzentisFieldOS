import { currentRole } from "@/lib/current-role";
import { OwnerDashboard } from "./_components/owner-dashboard";
import { SupervisorHome } from "./_components/supervisor-home";

// The landing surface is role-aware (simplicity review 2026-09-01): a Site
// Supervisor gets the task-first Home (one tap to Daily Report / Material
// entries / Attendance / Photos), the Owner/Admin keeps the cross-Site
// rollup Dashboard. Same route, two surfaces — the role comes from the real
// GET /users/me identity (never a viewport heuristic), and a failed lookup
// falls back to the least-privileged Supervisor surface.
//
// The picked surface is awaited here (called as a function, not rendered as
// an async-element child): both are server components with no client
// boundary, and this keeps the page a plain awaitable for tests.
export default async function HomePage() {
  const role = await currentRole();
  if (role === "SITE_SUPERVISOR") return await SupervisorHome();
  return await OwnerDashboard();
}
