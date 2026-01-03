/*
  Warnings:

  - A unique constraint covering the columns `[familyId,linkedUserId]` on the table `family_members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "family_members_linkedUserId_key";

-- CreateIndex
CREATE UNIQUE INDEX "family_linked_user_unique" ON "family_members"("familyId", "linkedUserId");
