import { redirect } from "next/navigation";

// The desktop DSR-creation surface was retired by the 2026-09-01 simplicity
// review (the responsive /dsr/new form serves both form factors); this stub
// keeps old bookmarks and shared links working instead of 404ing.
export default function LegacyNewDailyActivityPage() {
  redirect("/dsr/new");
}
