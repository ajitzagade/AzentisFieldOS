// Pure data, zero imports beyond the language itself — deliberately kept
// separate from seed.ts. Spec files import these constants freely; seed.ts
// (which pulls in Prisma and runs a destructive TRUNCATE) must only ever be
// executed directly as a script by e2e/global-setup.ts, never imported —
// see the incident note in seed.ts.
export const OWNER_EMAIL = "owner@e2e.test";
export const OWNER_PASSWORD = "e2e-owner-password-1";
export const SUPERVISOR_EMAIL = "supervisor@e2e.test";
export const SUPERVISOR_PASSWORD = "e2e-supervisor-password-1";

export const SITE_NAME = "NH-48 Highway Widening — Package 3";
export const MATERIAL_NAME = "Cement";
export const MATERIAL_SIZE_LABEL = "OPC 53 Grade";
export const UNIT_NAME = "Bags";
export const VENDOR_NAME = "Shree Balaji Traders";
export const TEAM_MEMBER_NAME = "Ravi Kumar";
