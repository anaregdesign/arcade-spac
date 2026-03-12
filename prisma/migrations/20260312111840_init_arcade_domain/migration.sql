-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entraObjectId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingSeenAt" DATETIME,
    "visibilityScope" TEXT NOT NULL DEFAULT 'TENANT_ONLY'
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "tagline" TEXT,
    "favoriteGame" TEXT,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "totalPlayCount" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" DATETIME,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "rulesSummary" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PlayResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    "cleared" BOOLEAN NOT NULL,
    "leaderboardEligible" BOOLEAN NOT NULL,
    "primaryMetric" INTEGER NOT NULL,
    "secondaryMetric" INTEGER,
    "hintCount" INTEGER,
    "mistakeCount" INTEGER,
    "competitivePoints" INTEGER NOT NULL,
    "totalPointsDelta" INTEGER NOT NULL DEFAULT 0,
    "rankDelta" INTEGER,
    "isPersonalBest" BOOLEAN NOT NULL DEFAULT false,
    "summaryText" TEXT NOT NULL,
    "sharePath" TEXT,
    CONSTRAINT "PlayResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodType" TEXT NOT NULL,
    "gameId" TEXT,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "deltaToLeader" INTEGER,
    "deltaToNext" INTEGER,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeaderboardEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserGameSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "currentRank" INTEGER,
    "bestCompetitivePoints" INTEGER NOT NULL DEFAULT 0,
    "personalBestMetric" INTEGER,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" DATETIME,
    "recommendationText" TEXT,
    CONSTRAINT "UserGameSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserGameSummary_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserOverallSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentRank" INTEGER,
    "trendDelta" INTEGER NOT NULL DEFAULT 0,
    "recentPlaySummary" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserOverallSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_entraObjectId_key" ON "User"("entraObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_key_key" ON "Game"("key");

-- CreateIndex
CREATE INDEX "PlayResult_userId_gameId_startedAt_idx" ON "PlayResult"("userId", "gameId", "startedAt");

-- CreateIndex
CREATE INDEX "PlayResult_gameId_status_competitivePoints_idx" ON "PlayResult"("gameId", "status", "competitivePoints");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_periodType_gameId_rank_idx" ON "LeaderboardEntry"("periodType", "gameId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_periodType_gameId_userId_key" ON "LeaderboardEntry"("periodType", "gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameSummary_userId_gameId_key" ON "UserGameSummary"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOverallSummary_userId_periodType_key" ON "UserOverallSummary"("userId", "periodType");
