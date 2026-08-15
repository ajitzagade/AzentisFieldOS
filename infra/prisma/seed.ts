import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../apps/api/src/generated/prisma/client";

// FR-19/NFR-4: EmploymentType is admin-configurable data, not a hardcoded
// enum — these three rows preserve the old enum's values as the day-one
// default so existing behavior is unchanged; only the mechanism becomes
// configurable (Epic 14 owns the admin UI to add more later).
const DEFAULT_EMPLOYMENT_TYPES = ["Monthly", "Weekly", "Daily Wage"];

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

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
