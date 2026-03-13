import { prisma } from "../app/lib/server/infrastructure/prisma.server";

const userIds = {
  aiko: "user-aiko",
  ren: "user-ren",
  mio: "user-mio",
} as const;

const gameIds = {
  colorSweep: "game-color-sweep",
  dropLine: "game-drop-line",
  minesweeper: "game-minesweeper",
  numberChain: "game-number-chain",
  pairFlip: "game-pair-flip",
  sudoku: "game-sudoku",
} as const;

async function main() {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.userGameSummary.deleteMany();
  await prisma.userOverallSummary.deleteMany();
  await prisma.playResult.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  await prisma.game.createMany({
    data: [
      {
        id: gameIds.colorSweep,
        key: "COLOR_SWEEP",
        name: "Color Sweep",
        shortDescription: "Clear every tile that matches the target color before the timer expires.",
        accentColor: "#14b8a6",
        rulesSummary: "Only the target color counts. Wrong taps lower quality, and timeouts stay in history only.",
      },
      {
        id: gameIds.dropLine,
        key: "DROP_LINE",
        name: "Drop Line",
        shortDescription: "Tap when the falling ball overlaps the target line to keep the offset tiny.",
        accentColor: "#f97316",
        rulesSummary: "A smaller hit offset scores better. Missed drops stay in history only and do not enter rankings.",
      },
      {
        id: gameIds.minesweeper,
        key: "MINESWEEPER",
        name: "Minesweeper",
        shortDescription: "Clear the board quickly while keeping mistakes low.",
        accentColor: "#ea580c",
        rulesSummary: "Reveal all safe tiles. Mistakes cost quality score and leaderboard points.",
      },
      {
        id: gameIds.numberChain,
        key: "NUMBER_CHAIN",
        name: "Number Chain",
        shortDescription: "Tap the shuffled numbers in ascending order before the timer expires.",
        accentColor: "#3b82f6",
        rulesSummary: "Only the next number advances the chain. Wrong taps lower quality, and timeouts stay in history only.",
      },
      {
        id: gameIds.pairFlip,
        key: "PAIR_FLIP",
        name: "Pair Flip",
        shortDescription: "Flip cards two at a time and match every symbol before the timer expires.",
        accentColor: "#7c3aed",
        rulesSummary: "Mismatched cards flip back after a short reveal. Timeouts stay in history only.",
      },
      {
        id: gameIds.sudoku,
        key: "SUDOKU",
        name: "Sudoku",
        shortDescription: "Complete the grid with as few hints and errors as possible.",
        accentColor: "#0f766e",
        rulesSummary: "Finish the puzzle fast. Hints lower quality and can remove leaderboard eligibility.",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: userIds.aiko,
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-aiko",
        displayName: "Aiko Tanaka",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Aiko",
        onboardingSeenAt: new Date("2026-03-01T09:00:00.000Z"),
        visibilityScope: "TENANT_ONLY",
      },
      {
        id: userIds.ren,
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-ren",
        displayName: "Ren Sato",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Ren",
        onboardingSeenAt: new Date("2026-03-02T09:00:00.000Z"),
        visibilityScope: "TENANT_ONLY",
      },
      {
        id: userIds.mio,
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-mio",
        displayName: "Mio Kuroda",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Mio",
        visibilityScope: "TENANT_ONLY",
      },
    ],
  });

  await prisma.userProfile.createMany({
    data: [
      {
        userId: userIds.aiko,
        tagline: "Going for top seasonal rank across every puzzle.",
        favoriteGame: "MINESWEEPER",
        streakDays: 5,
        totalPlayCount: 18,
        lastPlayedAt: new Date("2026-03-11T20:05:00.000Z"),
      },
      {
        userId: userIds.ren,
        tagline: "Sudoku specialist building overall score.",
        favoriteGame: "SUDOKU",
        streakDays: 3,
        totalPlayCount: 11,
        lastPlayedAt: new Date("2026-03-11T19:42:00.000Z"),
      },
      {
        userId: userIds.mio,
        tagline: "New challenger learning both games.",
        favoriteGame: "SUDOKU",
        streakDays: 1,
        totalPlayCount: 4,
        lastPlayedAt: new Date("2026-03-10T18:15:00.000Z"),
      },
    ],
  });

  await prisma.playResult.createMany({
    data: [
      {
        id: "play-aiko-mine-1",
        userId: userIds.aiko,
        gameId: gameIds.minesweeper,
        difficulty: "HARD",
        startedAt: new Date("2026-03-11T19:55:00.000Z"),
        finishedAt: new Date("2026-03-11T20:00:32.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 332,
        secondaryMetric: 0,
        mistakeCount: 0,
        competitivePoints: 1420,
        totalPointsDelta: 120,
        rankDelta: 1,
        isPersonalBest: true,
        summaryText: "Hard cleared in 5:32 with no mistakes.",
        sharePath: "/results/play-aiko-mine-1",
      },
      {
        id: "play-aiko-sudoku-1",
        userId: userIds.aiko,
        gameId: gameIds.sudoku,
        difficulty: "NORMAL",
        startedAt: new Date("2026-03-11T20:02:00.000Z"),
        finishedAt: new Date("2026-03-11T20:10:40.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 520,
        hintCount: 1,
        competitivePoints: 810,
        totalPointsDelta: 35,
        rankDelta: 0,
        isPersonalBest: false,
        summaryText: "Normal cleared in 8:40 with one hint.",
        sharePath: "/results/play-aiko-sudoku-1",
      },
      {
        id: "play-ren-sudoku-1",
        userId: userIds.ren,
        gameId: gameIds.sudoku,
        difficulty: "HARD",
        startedAt: new Date("2026-03-11T19:28:00.000Z"),
        finishedAt: new Date("2026-03-11T19:35:15.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 435,
        hintCount: 0,
        competitivePoints: 1510,
        totalPointsDelta: 140,
        rankDelta: 1,
        isPersonalBest: true,
        summaryText: "Hard cleared in 7:15 with no hints.",
        sharePath: "/results/play-ren-sudoku-1",
      },
      {
        id: "play-ren-mine-1",
        userId: userIds.ren,
        gameId: gameIds.minesweeper,
        difficulty: "NORMAL",
        startedAt: new Date("2026-03-11T19:38:00.000Z"),
        finishedAt: new Date("2026-03-11T19:42:10.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 250,
        secondaryMetric: 1,
        mistakeCount: 1,
        competitivePoints: 920,
        totalPointsDelta: 52,
        rankDelta: 0,
        isPersonalBest: false,
        summaryText: "Normal cleared in 4:10 with one mistake.",
        sharePath: "/results/play-ren-mine-1",
      },
      {
        id: "play-mio-sudoku-pending",
        userId: userIds.mio,
        gameId: gameIds.sudoku,
        difficulty: "EASY",
        startedAt: new Date("2026-03-10T18:00:00.000Z"),
        finishedAt: new Date("2026-03-10T18:15:10.000Z"),
        status: "PENDING_SAVE",
        cleared: true,
        leaderboardEligible: false,
        primaryMetric: 910,
        hintCount: 2,
        competitivePoints: 320,
        totalPointsDelta: 0,
        isPersonalBest: false,
        summaryText: "Easy cleared but save is still pending.",
      },
      {
        id: "play-mio-mine-abandoned",
        userId: userIds.mio,
        gameId: gameIds.minesweeper,
        difficulty: "EASY",
        startedAt: new Date("2026-03-10T17:45:00.000Z"),
        finishedAt: new Date("2026-03-10T17:48:00.000Z"),
        status: "ABANDONED",
        cleared: false,
        leaderboardEligible: false,
        primaryMetric: 180,
        mistakeCount: 2,
        competitivePoints: 0,
        totalPointsDelta: 0,
        isPersonalBest: false,
        summaryText: "Left the board mid-run and it was recorded as abandoned.",
      },
    ],
  });

  await prisma.userGameSummary.createMany({
    data: [
      {
        userId: userIds.aiko,
        gameId: gameIds.minesweeper,
        currentRank: 1,
        bestCompetitivePoints: 1420,
        personalBestMetric: 332,
        playCount: 9,
        completedCount: 9,
        lastPlayedAt: new Date("2026-03-11T20:00:32.000Z"),
        recommendationText: "One more clean hard run should widen the seasonal lead.",
      },
      {
        userId: userIds.aiko,
        gameId: gameIds.sudoku,
        currentRank: 2,
        bestCompetitivePoints: 810,
        personalBestMetric: 520,
        playCount: 9,
        completedCount: 7,
        lastPlayedAt: new Date("2026-03-11T20:10:40.000Z"),
        recommendationText: "Sudoku is the easiest place to add total points this week.",
      },
      {
        userId: userIds.ren,
        gameId: gameIds.sudoku,
        currentRank: 1,
        bestCompetitivePoints: 1510,
        personalBestMetric: 435,
        playCount: 6,
        completedCount: 6,
        lastPlayedAt: new Date("2026-03-11T19:35:15.000Z"),
        recommendationText: "Keep the no-hint streak to lock the top rank.",
      },
      {
        userId: userIds.ren,
        gameId: gameIds.minesweeper,
        currentRank: 2,
        bestCompetitivePoints: 920,
        personalBestMetric: 250,
        playCount: 5,
        completedCount: 4,
        lastPlayedAt: new Date("2026-03-11T19:42:10.000Z"),
        recommendationText: "A clean normal clear would likely overtake the top seasonal score.",
      },
      {
        userId: userIds.mio,
        gameId: gameIds.sudoku,
        currentRank: null,
        bestCompetitivePoints: 320,
        personalBestMetric: 910,
        playCount: 2,
        completedCount: 1,
        lastPlayedAt: new Date("2026-03-10T18:15:10.000Z"),
        recommendationText: "Save the pending run or replay to enter the leaderboard.",
      },
      {
        userId: userIds.mio,
        gameId: gameIds.minesweeper,
        currentRank: null,
        bestCompetitivePoints: 0,
        personalBestMetric: null,
        playCount: 2,
        completedCount: 0,
        lastPlayedAt: new Date("2026-03-10T17:48:00.000Z"),
        recommendationText: "Finish an easy run to establish the first ranked result.",
      },
    ],
  });

  await prisma.userOverallSummary.createMany({
    data: [
      {
        userId: userIds.aiko,
        periodType: "SEASON",
        totalPoints: 2230,
        currentRank: 1,
        trendDelta: 1,
        recentPlaySummary: "Minesweeper personal best pushed Aiko to the top of the season.",
      },
      {
        userId: userIds.aiko,
        periodType: "LIFETIME",
        totalPoints: 5820,
        currentRank: 1,
        trendDelta: 0,
        recentPlaySummary: "Holding the all-time lead across both games.",
      },
      {
        userId: userIds.ren,
        periodType: "SEASON",
        totalPoints: 2180,
        currentRank: 2,
        trendDelta: 1,
        recentPlaySummary: "Sudoku form is excellent but total points still trail Aiko by 50.",
      },
      {
        userId: userIds.ren,
        periodType: "LIFETIME",
        totalPoints: 5610,
        currentRank: 2,
        trendDelta: 0,
        recentPlaySummary: "Strong lifetime total led by Sudoku expertise.",
      },
      {
        userId: userIds.mio,
        periodType: "SEASON",
        totalPoints: 320,
        currentRank: 3,
        trendDelta: 0,
        recentPlaySummary: "Needs a confirmed result before the next leaderboard refresh.",
      },
      {
        userId: userIds.mio,
        periodType: "LIFETIME",
        totalPoints: 320,
        currentRank: 3,
        trendDelta: 0,
        recentPlaySummary: "Early activity is recorded, but ranked progress is just beginning.",
      },
    ],
  });

  await prisma.leaderboardEntry.createMany({
    data: [
      {
        periodType: "SEASON",
        userId: userIds.aiko,
        rank: 1,
        points: 2230,
        deltaToLeader: 0,
        deltaToNext: 50,
      },
      {
        periodType: "SEASON",
        userId: userIds.ren,
        rank: 2,
        points: 2180,
        deltaToLeader: 50,
        deltaToNext: 1860,
      },
      {
        periodType: "SEASON",
        userId: userIds.mio,
        rank: 3,
        points: 320,
        deltaToLeader: 1910,
        deltaToNext: null,
      },
      {
        periodType: "SEASON",
        gameId: gameIds.minesweeper,
        userId: userIds.aiko,
        rank: 1,
        points: 1420,
        deltaToLeader: 0,
        deltaToNext: 500,
      },
      {
        periodType: "SEASON",
        gameId: gameIds.minesweeper,
        userId: userIds.ren,
        rank: 2,
        points: 920,
        deltaToLeader: 500,
        deltaToNext: null,
      },
      {
        periodType: "SEASON",
        gameId: gameIds.sudoku,
        userId: userIds.ren,
        rank: 1,
        points: 1510,
        deltaToLeader: 0,
        deltaToNext: 700,
      },
      {
        periodType: "SEASON",
        gameId: gameIds.sudoku,
        userId: userIds.aiko,
        rank: 2,
        points: 810,
        deltaToLeader: 700,
        deltaToNext: 490,
      },
      {
        periodType: "SEASON",
        gameId: gameIds.sudoku,
        userId: userIds.mio,
        rank: 3,
        points: 320,
        deltaToLeader: 1190,
        deltaToNext: null,
      },
    ],
  });

  console.log("Seeded arcade baseline data.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
