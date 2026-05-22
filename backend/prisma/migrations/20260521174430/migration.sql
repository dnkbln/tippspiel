-- CreateTable
CREATE TABLE "CompetitionScoringRule" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "exactScorePoints" INTEGER NOT NULL,
    "goalDifferencePoints" INTEGER NOT NULL,
    "tendencyPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionScoringRule_competitionId_key" ON "CompetitionScoringRule"("competitionId");

-- AddForeignKey
ALTER TABLE "CompetitionScoringRule" ADD CONSTRAINT "CompetitionScoringRule_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
