-- CreateEnum
CREATE TYPE "GameResultDecision" AS ENUM ('REGULAR_TIME', 'EXTRA_TIME', 'PENALTIES');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "advancingTeamId" TEXT,
ADD COLUMN     "awayGoals" INTEGER,
ADD COLUMN     "homeGoals" INTEGER,
ADD COLUMN     "resultDecision" "GameResultDecision",
ADD COLUMN     "resultEnteredAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_advancingTeamId_fkey" FOREIGN KEY ("advancingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
