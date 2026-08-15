-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "employmentType",
ADD COLUMN     "employmentTypeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "EmploymentType";

-- CreateTable
CREATE TABLE "EmploymentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmploymentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentType_name_key" ON "EmploymentType"("name");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_employmentTypeId_fkey" FOREIGN KEY ("employmentTypeId") REFERENCES "EmploymentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
