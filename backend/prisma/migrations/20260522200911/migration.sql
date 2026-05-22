-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "advancingTeamId" TEXT;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_advancingTeamId_fkey" FOREIGN KEY ("advancingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
