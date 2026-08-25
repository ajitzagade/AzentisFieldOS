import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
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

// FR-25-ish, NFR-4: same reasoning as EmploymentType/MachineryType/VehicleType
// above — ExpenseCategory is admin-configurable data (Epic 14 owns the admin
// UI), these are just day-one defaults so DSR-embedded Expense entries
// (Epic 3's dsrExpenseSchema) aren't unusable before Epic 11's own CRUD ships.
const DEFAULT_EXPENSE_CATEGORIES = [
  "Fuel & Transport",
  "Site Miscellaneous",
  "Labour Welfare",
  "Office & Admin",
];

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

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
