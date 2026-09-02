import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../apps/api/src/generated/prisma/client";
import {
  MATERIAL_NAME,
  MATERIAL_SIZE_LABEL,
  OWNER_EMAIL,
  OWNER_PASSWORD,
  SITE_NAME,
  SUPERVISOR_EMAIL,
  SUPERVISOR_PASSWORD,
  TEAM_MEMBER_NAME,
  UNIT_NAME,
  VENDOR_NAME,
} from "./test-users";

// Seeds the DEDICATED e2e database (azentisfieldos_e2e, see e2e/README.md)
// with a deterministic starting fixture set. Safety: this file only ever
// runs against DATABASE_URL passed in explicitly by e2e/global-setup.ts,
// which hard-codes the local e2e connection string — it is never invoked
// against the dev DB (azentisfieldos), the vitest integration DB
// (azentisfieldos_test), or production (Neon). A guard below refuses to run
// against anything whose connection string doesn't look like the local e2e
// database, so a misconfigured env can never wipe the wrong database.
//
// INCIDENT NOTE (caught in dev, nothing lost): this file used to hold the
// OWNER_EMAIL/etc. constants directly, and spec files imported them from
// here for convenience. Because this file's `main()` used to run
// unconditionally at module-load time, simply IMPORTING it (to get a string
// constant) re-ran the full reset+seed — inside the Playwright test
// process, using whatever DATABASE_URL was ambient in that shell, not the
// override this file's own spawner sets. `assertSafeToWipe` refused the
// run (ambient DATABASE_URL pointed at the dev DB), so nothing was
// actually wiped — but the fix is structural, not just the guard: the
// constants now live in test-users.ts (zero imports, safe anywhere), and
// this file is CLI-only — see the `require.main === module` guard at the
// bottom. Never remove that guard, and never re-export constants from this
// file for a spec to import.

function assertSafeToWipe(databaseUrl: string | undefined) {
  if (!databaseUrl || !databaseUrl.includes("azentisfieldos_e2e")) {
    throw new Error(
      `Refusing to seed/reset: DATABASE_URL does not point at the local e2e database (azentisfieldos_e2e). Got: ${databaseUrl ?? "<unset>"}`,
    );
  }
}

// Every table in the schema (kept as an explicit list, not introspected, so
// a new model shows up here as a deliberate addition during review rather
// than silent auto-discovery). TRUNCATE ... CASCADE lets Postgres resolve FK
// order itself — far less fragile than hand-maintaining delete order across
// ~38 tables and a schema that's still evolving.
const ALL_TABLES = [
  "AuditLog",
  "Photo",
  "ReportDelivery",
  "DailyReport",
  "DailySiteReport",
  "WasteDisposal",
  "RmcEntry",
  "Expense",
  "Payment",
  "AdvanceAdjustment",
  "Advance",
  "WorkRecord",
  "ReturnWastage",
  "Consumption",
  "Movement",
  "Purchase",
  "SiteStock",
  "GodownStock",
  "MachineryMovementLog",
  "MachineryServiceLog",
  "VehicleMovementLog",
  "VehicleServiceLog",
  "Machinery",
  "Vehicle",
  "TeamMember",
  "Vendor",
  "MaterialSize",
  "Material",
  "MaterialCategory",
  "Unit",
  "Site",
  "EmploymentType",
  "MachineryType",
  "VehicleType",
  "ExpenseCategory",
  "NotificationChannelSetting",
  "ReportSchedule",
  "BrandingConfig",
  "User",
];

async function resetDatabase(prisma: PrismaClient) {
  const quoted = ALL_TABLES.map((name) => `"${name}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  assertSafeToWipe(databaseUrl);

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  await resetDatabase(prisma);

  const [ownerHash, supervisorHash] = await Promise.all([
    bcrypt.hash(OWNER_PASSWORD, 10),
    bcrypt.hash(SUPERVISOR_PASSWORD, 10),
  ]);

  await prisma.user.create({
    data: { name: "Priya Owner", email: OWNER_EMAIL, passwordHash: ownerHash, role: "OWNER_ADMIN" },
  });
  await prisma.user.create({
    data: { name: "Ramesh Yadav", email: SUPERVISOR_EMAIL, passwordHash: supervisorHash, role: "SITE_SUPERVISOR" },
  });

  await prisma.brandingConfig.create({ data: { tenantName: "AzentisFieldOS E2E" } });

  await prisma.site.create({
    data: { name: SITE_NAME, location: "Nashik, Maharashtra", status: "ACTIVE" },
  });

  const unit = await prisma.unit.create({ data: { name: UNIT_NAME } });
  const category = await prisma.materialCategory.create({ data: { name: "Cement & Binders" } });
  const material = await prisma.material.create({
    data: { name: MATERIAL_NAME, categoryId: category.id, unitId: unit.id },
  });
  await prisma.materialSize.create({ data: { materialId: material.id, label: MATERIAL_SIZE_LABEL } });

  await prisma.vendor.create({ data: { name: VENDOR_NAME } });

  const employmentType = await prisma.employmentType.create({ data: { name: "Daily Wage" } });
  await prisma.machineryType.create({ data: { name: "Excavator" } });
  await prisma.vehicleType.create({ data: { name: "Truck" } });
  await prisma.expenseCategory.create({ data: { name: "Fuel" } });

  await prisma.teamMember.create({
    data: { name: TEAM_MEMBER_NAME, designation: "Mason", employmentTypeId: employmentType.id },
  });

  await prisma.$disconnect();
  console.log("e2e database reset + seeded.");
}

// CLI-only guard: this must run ONLY when the file is executed directly
// (`npx tsx e2e/fixtures/seed.ts`), never as a side effect of another module
// importing it. See the incident note above.
if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
