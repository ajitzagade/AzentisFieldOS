import { createIcon } from "./create-icon";

// Not in _shared-kit.html's 26-icon inventory — that set predates the
// Site edit flow (story 2.2/2.3), which is the first place this product
// needs a genuine "Edit" affordance for master data (EXPERIENCE.md's
// Component Patterns table). Drawn to match the same visual language as
// every other icon here (24x24, 1.75 stroke, round caps/joins) rather
// than pulled from an unrelated icon library.
export const PencilIcon = createIcon(
  "PencilIcon",
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </>,
  1.75,
);
