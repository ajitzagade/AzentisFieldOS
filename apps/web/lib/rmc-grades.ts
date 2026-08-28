// RMC grades are not their own table — they are the active Materials of the
// admin-managed "RMC" Material Category (e.g. "RMC M10" … "RMC M35"), the
// same rows the Materials taxonomy screen edits. Every RMC Grade field
// derives its picker options from that one list, so adding a grade in
// Materials → RMC immediately offers it everywhere; forms fall back to free
// text when the Category is absent or empty (RmcEntry.grade stays a plain
// string either way).
interface MaterialWithCategory {
  name: string;
  isActive?: boolean;
  category?: { name: string } | null;
}

export function rmcGradeOptions(materials: MaterialWithCategory[]): string[] {
  return materials
    .filter((material) => material.isActive && material.category?.name.trim().toLowerCase() === "rmc")
    .map((material) =>
      // "RMC M25" reads well as a Material name but the grade itself is
      // "M25" — strip the redundant Category prefix for the stored value.
      material.name.replace(/^rmc\s+/i, "").trim(),
    )
    .filter((grade, index, all) => grade.length > 0 && all.indexOf(grade) === index)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
