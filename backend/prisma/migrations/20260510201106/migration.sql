-- CreateTable
CREATE TABLE "BootstrapSetup" (
    "id" TEXT NOT NULL DEFAULT 'initial',
    "tokenHash" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BootstrapSetup_pkey" PRIMARY KEY ("id")
);
