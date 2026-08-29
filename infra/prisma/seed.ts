import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../apps/api/src/generated/prisma/client";

// FR-19/NFR-4: EmploymentType is admin-configurable data, not a hardcoded
// enum — these three rows preserve the old enum's values as the day-one
// default so existing behavior is unchanged; only the mechanism becomes
// configurable (Epic 14 owns the admin UI to add more later).
const DEFAULT_EMPLOYMENT_TYPES = ["Monthly", "Weekly", "Daily Wage"];

// FR-15/FR-16, NFR-4: same reasoning as EmploymentType above — common
// defaults so the Machinery/Vehicle registers aren't unusable on day one.
const DEFAULT_MACHINERY_TYPES = ["Excavator", "Mixer", "Crane"];
const DEFAULT_VEHICLE_TYPES = ["Truck", "Dumper", "Tempo"];

// FR-41/NFR-4 (Story 11.1 AC #1): ExpenseCategory is admin-configurable data
// (Epic 14 owns the admin UI), not a hardcoded enum — these are the nine
// day-one defaults the AC names verbatim, so the Expense form has categories
// to pick from and DSR-embedded Expense entries (Epic 3's dsrExpenseSchema)
// aren't unusable before Epic 14's full admin CRUD ships. Idempotent upsert
// on the unique name, same shape as the lookup-table seeds above.
const DEFAULT_EXPENSE_CATEGORIES = [
  "Material",
  "Labour",
  "Machinery & Vehicle",
  "Fuel",
  "Repairs",
  "Transportation",
  "Site Expenses",
  "RMC",
  "Misc",
];

// Story 13.1 (FR-32) AC #1: BrandingConfig must exist "from day one" with
// sensible defaults so the auto-report compiler has a Tenant name/color/logo
// to snapshot without hard-depending on Epic 14's admin UI. The Tenant name
// is read from the committed infra/tenants/<slug>.json config if one is
// present at seed time (the same per-deployment config every tenant already
// ships), falling back to a neutral placeholder otherwise; primaryColor
// defaults (via the schema) to this product's own accent-teal-700 token;
// no logo. Singleton — seeded exactly once, never a second row.
function resolveTenantName(): string {
  try {
    const tenantsDir = path.join(__dirname, "..", "tenants");
    const file = readdirSync(tenantsDir).find(
      (name) => name.endsWith(".json") && !name.startsWith("_"),
    );
    if (!file) return "Your Company";
    const config = JSON.parse(
      readFileSync(path.join(tenantsDir, file), "utf8"),
    ) as { displayName?: string };
    return config.displayName?.trim() || "Your Company";
  } catch {
    return "Your Company";
  }
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const name of DEFAULT_EMPLOYMENT_TYPES) {
    await prisma.employmentType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of DEFAULT_MACHINERY_TYPES) {
    await prisma.machineryType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of DEFAULT_VEHICLE_TYPES) {
    await prisma.vehicleType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Replaces the old "first Clerk login becomes OWNER_ADMIN" auto-
  // provisioning: with custom auth, login requires an existing User row, so
  // each tenant deployment's first admin is created here instead. Runs at
  // most once — a User table that already has rows (e.g. a re-run seed, or
  // an already-onboarded tenant) is left untouched, and a deployment with no
  // SEED_ADMIN_* set simply skips this (nothing to seed yet).
  const hasAnyUser = (await prisma.user.count()) > 0;
  if (
    !hasAnyUser &&
    process.env.SEED_ADMIN_EMAIL &&
    process.env.SEED_ADMIN_PASSWORD
  ) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        name: process.env.SEED_ADMIN_NAME?.trim() || "Owner Admin",
        email: process.env.SEED_ADMIN_EMAIL,
        passwordHash,
        role: "OWNER_ADMIN",
      },
    });
  }

  // Singleton BrandingConfig — create exactly one row if none exists yet.
  // Idempotent: a re-run never adds a second row and never overwrites an
  // admin's later edits (Epic 14).
  const existingBranding = await prisma.brandingConfig.findFirst();
  if (!existingBranding) {
    await prisma.brandingConfig.create({
      data: { tenantName: resolveTenantName() },
    });
  }

  // Story 14.4 (FR-50): seed NotificationChannelSetting with exactly the three
  // rows Story 13.1's hardcoded delivery default implied, so switching
  // ReportDeliveryService to read from this table does NOT change day-one
  // behaviour. EMAIL: enabled, recipients = the current Owner/Admin user ids
  // (Story 13.1 mailed every Owner/Admin). IN_APP: enabled, recipients
  // irrelevant (in-app "delivery" has no per-user targeting). WHATSAPP:
  // disabled, empty (its BSP adapter is still the not-configured placeholder).
  // Idempotent upsert on the unique channel; `update: {}` never clobbers an
  // admin's later edits (Epic 14).
  const ownerAdmins = await prisma.user.findMany({
    where: { role: "OWNER_ADMIN" },
    select: { id: true },
  });
  const ownerAdminIds = ownerAdmins.map((user) => user.id);

  const notificationChannelDefaults: {
    channel: string;
    enabled: boolean;
    recipientUserIds: string[];
  }[] = [
    { channel: "EMAIL", enabled: true, recipientUserIds: ownerAdminIds },
    { channel: "IN_APP", enabled: true, recipientUserIds: [] },
    { channel: "WHATSAPP", enabled: false, recipientUserIds: [] },
  ];

  for (const setting of notificationChannelDefaults) {
    await prisma.notificationChannelSetting.upsert({
      where: { channel: setting.channel },
      update: {},
      create: setting,
    });
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
