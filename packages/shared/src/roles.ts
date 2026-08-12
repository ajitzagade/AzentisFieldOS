// In-app Role set — see SPEC.md Glossary and architecture spine AD-11.
// "Platform Operator" is deliberately NOT in this list: it is a credential-level
// concern outside the running app, never an in-app role. Do not add it here.
export const ROLES = ["OWNER_ADMIN", "SITE_SUPERVISOR"] as const;

export type Role = (typeof ROLES)[number];
