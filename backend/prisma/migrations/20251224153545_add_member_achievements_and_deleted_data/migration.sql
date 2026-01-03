-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "deletedData" JSONB;

-- CreateTable
CREATE TABLE "member_achievements" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "customCategory" TEXT,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_achievements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member_achievements" ADD CONSTRAINT "member_achievements_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
