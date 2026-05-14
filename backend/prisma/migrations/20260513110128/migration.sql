-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "awayTeamPlaceholder" TEXT,
ADD COLUMN     "homeTeamPlaceholder" TEXT,
ALTER COLUMN "homeTeamId" DROP NOT NULL,
ALTER COLUMN "awayTeamId" DROP NOT NULL;
