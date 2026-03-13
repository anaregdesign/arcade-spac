import { getRuntimeConfig } from "../config/runtime-config.server";
import type { GameKey, StoredGameKey } from "../../../domain/entities/game-catalog";
import { listPersistedGames, toStoredGameKey } from "../../../domain/entities/game-catalog";

type RankingPeriod = "SEASON" | "LIFETIME";
type RankingScope = "overall" | GameKey;
type FavoriteGame = StoredGameKey | null;
type VisibilityScope = "TENANT_ONLY" | "PRIVATE";

type DevUser = {
  id: string;
  entraTenantId: string;
  entraObjectId: string;
  displayName: string;
  avatarUrl: string | null;
  joinedAt: Date;
  onboardingSeenAt: Date | null;
  visibilityScope: VisibilityScope;
};

type DevUserProfile = {
  userId: string;
  tagline: string | null;
  favoriteGame: FavoriteGame;
  themePreference: "LIGHT" | "DARK";
  streakDays: number;
  totalPlayCount: number;
  lastPlayedAt: Date | null;
};

type DevGame = {
  id: string;
  key: StoredGameKey;
  name: string;
  shortDescription: string;
  accentColor: string;
  rulesSummary: string;
};

type DevPlayResult = {
  id: string;
  userId: string;
  gameId: string;
  difficulty: string;
  startedAt: Date;
  finishedAt: Date | null;
  status: "COMPLETED" | "FAILED" | "ABANDONED" | "PENDING_SAVE";
  cleared: boolean;
  leaderboardEligible: boolean;
  primaryMetric: number;
  secondaryMetric: number | null;
  hintCount: number | null;
  mistakeCount: number | null;
  competitivePoints: number;
  totalPointsDelta: number;
  rankDelta: number | null;
  isPersonalBest: boolean;
  summaryText: string;
  sharePath: string | null;
  shareToken: string | null;
};

type DevUserGameSummary = {
  id: string;
  userId: string;
  gameId: string;
  currentRank: number | null;
  bestCompetitivePoints: number;
  personalBestMetric: number | null;
  playCount: number;
  completedCount: number;
  lastPlayedAt: Date | null;
  recommendationText: string | null;
};

type DevUserOverallSummary = {
  id: string;
  userId: string;
  periodType: RankingPeriod;
  totalPoints: number;
  currentRank: number | null;
  trendDelta: number;
  recentPlaySummary: string | null;
  updatedAt: Date;
};

type DevLeaderboardEntry = {
  id: string;
  periodType: RankingPeriod;
  gameId: string | null;
  userId: string;
  rank: number;
  points: number;
  deltaToLeader: number | null;
  deltaToNext: number | null;
  capturedAt: Date;
};

type DevState = {
  users: DevUser[];
  profiles: DevUserProfile[];
  games: DevGame[];
  playResults: DevPlayResult[];
  gameSummaries: DevUserGameSummary[];
  overallSummaries: DevUserOverallSummary[];
  leaderboardEntries: DevLeaderboardEntry[];
};

const runtimeConfig = getRuntimeConfig();

function createInitialState(): DevState {
  const now = new Date("2026-03-13T08:30:00.000Z");

  return {
    users: [
      {
        id: "user-aiko",
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-aiko",
        displayName: "Aiko Tanaka",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Aiko",
        joinedAt: new Date("2026-03-01T09:00:00.000Z"),
        onboardingSeenAt: new Date("2026-03-01T09:00:00.000Z"),
        visibilityScope: "TENANT_ONLY",
      },
      {
        id: "user-hiroki",
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-hiroki",
        displayName: "Hiroki Mizukami",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Hiroki",
        joinedAt: new Date("2026-03-13T07:00:00.000Z"),
        onboardingSeenAt: null,
        visibilityScope: "TENANT_ONLY",
      },
      {
        id: "user-mio",
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-mio",
        displayName: "Mio Kuroda",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Mio",
        joinedAt: new Date("2026-03-03T09:00:00.000Z"),
        onboardingSeenAt: new Date("2026-03-03T09:00:00.000Z"),
        visibilityScope: "TENANT_ONLY",
      },
      {
        id: "user-ren",
        entraTenantId: "eecca864-7a91-4b48-9327-e19aa5cc3f35",
        entraObjectId: "entra-ren",
        displayName: "Ren Sato",
        avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=Ren",
        joinedAt: new Date("2026-03-02T09:00:00.000Z"),
        onboardingSeenAt: new Date("2026-03-02T09:00:00.000Z"),
        visibilityScope: "TENANT_ONLY",
      },
    ],
    profiles: [
      {
        userId: "user-aiko",
        tagline: "Going for top seasonal rank across every puzzle.",
        favoriteGame: "MINESWEEPER",
        themePreference: "LIGHT",
        streakDays: 5,
        totalPlayCount: 18,
        lastPlayedAt: new Date("2026-03-11T20:10:40.000Z"),
      },
      {
        userId: "user-hiroki",
        tagline: null,
        favoriteGame: null,
        themePreference: "LIGHT",
        streakDays: 0,
        totalPlayCount: 0,
        lastPlayedAt: null,
      },
      {
        userId: "user-mio",
        tagline: "New challenger learning the full lineup.",
        favoriteGame: "SUDOKU",
        themePreference: "DARK",
        streakDays: 1,
        totalPlayCount: 4,
        lastPlayedAt: new Date("2026-03-10T18:15:10.000Z"),
      },
      {
        userId: "user-ren",
        tagline: "Sudoku specialist building overall score.",
        favoriteGame: "SUDOKU",
        themePreference: "LIGHT",
        streakDays: 3,
        totalPlayCount: 11,
        lastPlayedAt: new Date("2026-03-11T19:42:10.000Z"),
      },
    ],
    games: listPersistedGames(),
    playResults: [
      {
        id: "play-aiko-mine-1",
        userId: "user-aiko",
        gameId: "game-minesweeper",
        difficulty: "HARD",
        startedAt: new Date("2026-03-11T19:55:00.000Z"),
        finishedAt: new Date("2026-03-11T20:00:32.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 332,
        secondaryMetric: 0,
        hintCount: null,
        mistakeCount: 0,
        competitivePoints: 1420,
        totalPointsDelta: 120,
        rankDelta: 1,
        isPersonalBest: true,
        summaryText: "Hard cleared in 5:32 with no mistakes.",
        sharePath: "/results/play-aiko-mine-1",
        shareToken: "share-aiko-mine-1",
      },
      {
        id: "play-aiko-sudoku-1",
        userId: "user-aiko",
        gameId: "game-sudoku",
        difficulty: "NORMAL",
        startedAt: new Date("2026-03-11T20:02:00.000Z"),
        finishedAt: new Date("2026-03-11T20:10:40.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 520,
        secondaryMetric: null,
        hintCount: 1,
        mistakeCount: 0,
        competitivePoints: 810,
        totalPointsDelta: 35,
        rankDelta: 0,
        isPersonalBest: false,
        summaryText: "Normal cleared in 8:40 with one hint.",
        sharePath: "/results/play-aiko-sudoku-1",
        shareToken: "share-aiko-sudoku-1",
      },
      {
        id: "play-mio-sudoku-pending",
        userId: "user-mio",
        gameId: "game-sudoku",
        difficulty: "EASY",
        startedAt: new Date("2026-03-10T18:00:00.000Z"),
        finishedAt: new Date("2026-03-10T18:15:10.000Z"),
        status: "PENDING_SAVE",
        cleared: true,
        leaderboardEligible: false,
        primaryMetric: 910,
        secondaryMetric: null,
        hintCount: 2,
        mistakeCount: 0,
        competitivePoints: 320,
        totalPointsDelta: 0,
        rankDelta: null,
        isPersonalBest: false,
        summaryText: "Easy cleared but save is still pending.",
        sharePath: null,
        shareToken: null,
      },
      {
        id: "play-mio-mine-abandoned",
        userId: "user-mio",
        gameId: "game-minesweeper",
        difficulty: "EASY",
        startedAt: new Date("2026-03-10T17:45:00.000Z"),
        finishedAt: new Date("2026-03-10T17:48:00.000Z"),
        status: "ABANDONED",
        cleared: false,
        leaderboardEligible: false,
        primaryMetric: 180,
        secondaryMetric: null,
        hintCount: null,
        mistakeCount: 2,
        competitivePoints: 0,
        totalPointsDelta: 0,
        rankDelta: null,
        isPersonalBest: false,
        summaryText: "Left the board mid-run and it was recorded as abandoned.",
        sharePath: null,
        shareToken: null,
      },
      {
        id: "play-ren-sudoku-1",
        userId: "user-ren",
        gameId: "game-sudoku",
        difficulty: "HARD",
        startedAt: new Date("2026-03-11T19:28:00.000Z"),
        finishedAt: new Date("2026-03-11T19:35:15.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 435,
        secondaryMetric: null,
        hintCount: 0,
        mistakeCount: 0,
        competitivePoints: 1510,
        totalPointsDelta: 140,
        rankDelta: 1,
        isPersonalBest: true,
        summaryText: "Hard cleared in 7:15 with no hints.",
        sharePath: "/results/play-ren-sudoku-1",
        shareToken: "share-ren-sudoku-1",
      },
      {
        id: "play-ren-mine-1",
        userId: "user-ren",
        gameId: "game-minesweeper",
        difficulty: "NORMAL",
        startedAt: new Date("2026-03-11T19:38:00.000Z"),
        finishedAt: new Date("2026-03-11T19:42:10.000Z"),
        status: "COMPLETED",
        cleared: true,
        leaderboardEligible: true,
        primaryMetric: 250,
        secondaryMetric: 1,
        hintCount: null,
        mistakeCount: 1,
        competitivePoints: 920,
        totalPointsDelta: 52,
        rankDelta: 0,
        isPersonalBest: false,
        summaryText: "Normal cleared in 4:10 with one mistake.",
        sharePath: "/results/play-ren-mine-1",
        shareToken: "share-ren-mine-1",
      },
    ],
    gameSummaries: [
      {
        id: "summary-aiko-mine",
        userId: "user-aiko",
        gameId: "game-minesweeper",
        currentRank: 1,
        bestCompetitivePoints: 1420,
        personalBestMetric: 332,
        playCount: 9,
        completedCount: 9,
        lastPlayedAt: new Date("2026-03-11T20:00:32.000Z"),
        recommendationText: "One more clean hard run should widen the seasonal lead.",
      },
      {
        id: "summary-aiko-sudoku",
        userId: "user-aiko",
        gameId: "game-sudoku",
        currentRank: 2,
        bestCompetitivePoints: 810,
        personalBestMetric: 520,
        playCount: 9,
        completedCount: 7,
        lastPlayedAt: new Date("2026-03-11T20:10:40.000Z"),
        recommendationText: "Sudoku is the easiest place to add total points this week.",
      },
      {
        id: "summary-hiroki-mine",
        userId: "user-hiroki",
        gameId: "game-minesweeper",
        currentRank: null,
        bestCompetitivePoints: 0,
        personalBestMetric: null,
        playCount: 0,
        completedCount: 0,
        lastPlayedAt: null,
        recommendationText: "Start here if you want the quickest first ranked result.",
      },
      {
        id: "summary-hiroki-sudoku",
        userId: "user-hiroki",
        gameId: "game-sudoku",
        currentRank: null,
        bestCompetitivePoints: 0,
        personalBestMetric: null,
        playCount: 0,
        completedCount: 0,
        lastPlayedAt: null,
        recommendationText: "Choose Sudoku if you want a slower first run with hints available.",
      },
      {
        id: "summary-mio-mine",
        userId: "user-mio",
        gameId: "game-minesweeper",
        currentRank: null,
        bestCompetitivePoints: 0,
        personalBestMetric: null,
        playCount: 2,
        completedCount: 0,
        lastPlayedAt: new Date("2026-03-10T17:48:00.000Z"),
        recommendationText: "Finish an easy run to establish the first ranked result.",
      },
      {
        id: "summary-mio-sudoku",
        userId: "user-mio",
        gameId: "game-sudoku",
        currentRank: null,
        bestCompetitivePoints: 320,
        personalBestMetric: 910,
        playCount: 2,
        completedCount: 1,
        lastPlayedAt: new Date("2026-03-10T18:15:10.000Z"),
        recommendationText: "Save the pending run or replay to enter the leaderboard.",
      },
      {
        id: "summary-ren-mine",
        userId: "user-ren",
        gameId: "game-minesweeper",
        currentRank: 2,
        bestCompetitivePoints: 920,
        personalBestMetric: 250,
        playCount: 5,
        completedCount: 4,
        lastPlayedAt: new Date("2026-03-11T19:42:10.000Z"),
        recommendationText: "A clean normal clear would likely overtake the top seasonal score.",
      },
      {
        id: "summary-ren-sudoku",
        userId: "user-ren",
        gameId: "game-sudoku",
        currentRank: 1,
        bestCompetitivePoints: 1510,
        personalBestMetric: 435,
        playCount: 6,
        completedCount: 6,
        lastPlayedAt: new Date("2026-03-11T19:35:15.000Z"),
        recommendationText: "Keep the no-hint streak to lock the top rank.",
      },
    ],
    overallSummaries: [
      {
        id: "overall-aiko-season",
        userId: "user-aiko",
        periodType: "SEASON",
        totalPoints: 2230,
        currentRank: 1,
        trendDelta: 1,
        recentPlaySummary: "Minesweeper personal best pushed Aiko to the top of the season.",
        updatedAt: now,
      },
      {
        id: "overall-aiko-lifetime",
        userId: "user-aiko",
        periodType: "LIFETIME",
        totalPoints: 5820,
        currentRank: 1,
        trendDelta: 0,
        recentPlaySummary: "Holding the all-time lead across the current lineup.",
        updatedAt: now,
      },
      {
        id: "overall-hiroki-season",
        userId: "user-hiroki",
        periodType: "SEASON",
        totalPoints: 0,
        currentRank: null,
        trendDelta: 0,
        recentPlaySummary: null,
        updatedAt: now,
      },
      {
        id: "overall-hiroki-lifetime",
        userId: "user-hiroki",
        periodType: "LIFETIME",
        totalPoints: 0,
        currentRank: null,
        trendDelta: 0,
        recentPlaySummary: null,
        updatedAt: now,
      },
      {
        id: "overall-mio-season",
        userId: "user-mio",
        periodType: "SEASON",
        totalPoints: 320,
        currentRank: 3,
        trendDelta: 0,
        recentPlaySummary: "Needs a confirmed result before the next leaderboard refresh.",
        updatedAt: now,
      },
      {
        id: "overall-mio-lifetime",
        userId: "user-mio",
        periodType: "LIFETIME",
        totalPoints: 320,
        currentRank: 3,
        trendDelta: 0,
        recentPlaySummary: "Early activity is recorded, but ranked progress is just beginning.",
        updatedAt: now,
      },
      {
        id: "overall-ren-season",
        userId: "user-ren",
        periodType: "SEASON",
        totalPoints: 2180,
        currentRank: 2,
        trendDelta: 1,
        recentPlaySummary: "Sudoku form is excellent but total points still trail Aiko by 50.",
        updatedAt: now,
      },
      {
        id: "overall-ren-lifetime",
        userId: "user-ren",
        periodType: "LIFETIME",
        totalPoints: 5610,
        currentRank: 2,
        trendDelta: 0,
        recentPlaySummary: "Strong lifetime total led by Sudoku expertise.",
        updatedAt: now,
      },
    ],
    leaderboardEntries: [
      {
        id: "leader-overall-season-aiko",
        periodType: "SEASON",
        gameId: null,
        userId: "user-aiko",
        rank: 1,
        points: 2230,
        deltaToLeader: 0,
        deltaToNext: 50,
        capturedAt: now,
      },
      {
        id: "leader-overall-season-ren",
        periodType: "SEASON",
        gameId: null,
        userId: "user-ren",
        rank: 2,
        points: 2180,
        deltaToLeader: 50,
        deltaToNext: 1860,
        capturedAt: now,
      },
      {
        id: "leader-overall-season-mio",
        periodType: "SEASON",
        gameId: null,
        userId: "user-mio",
        rank: 3,
        points: 320,
        deltaToLeader: 1910,
        deltaToNext: null,
        capturedAt: now,
      },
      {
        id: "leader-overall-lifetime-aiko",
        periodType: "LIFETIME",
        gameId: null,
        userId: "user-aiko",
        rank: 1,
        points: 5820,
        deltaToLeader: 0,
        deltaToNext: 210,
        capturedAt: now,
      },
      {
        id: "leader-overall-lifetime-ren",
        periodType: "LIFETIME",
        gameId: null,
        userId: "user-ren",
        rank: 2,
        points: 5610,
        deltaToLeader: 210,
        deltaToNext: 5290,
        capturedAt: now,
      },
      {
        id: "leader-overall-lifetime-mio",
        periodType: "LIFETIME",
        gameId: null,
        userId: "user-mio",
        rank: 3,
        points: 320,
        deltaToLeader: 5500,
        deltaToNext: null,
        capturedAt: now,
      },
      {
        id: "leader-mine-season-aiko",
        periodType: "SEASON",
        gameId: "game-minesweeper",
        userId: "user-aiko",
        rank: 1,
        points: 1420,
        deltaToLeader: 0,
        deltaToNext: 500,
        capturedAt: now,
      },
      {
        id: "leader-mine-season-ren",
        periodType: "SEASON",
        gameId: "game-minesweeper",
        userId: "user-ren",
        rank: 2,
        points: 920,
        deltaToLeader: 500,
        deltaToNext: null,
        capturedAt: now,
      },
      {
        id: "leader-sudoku-season-ren",
        periodType: "SEASON",
        gameId: "game-sudoku",
        userId: "user-ren",
        rank: 1,
        points: 1510,
        deltaToLeader: 0,
        deltaToNext: 700,
        capturedAt: now,
      },
      {
        id: "leader-sudoku-season-aiko",
        periodType: "SEASON",
        gameId: "game-sudoku",
        userId: "user-aiko",
        rank: 2,
        points: 810,
        deltaToLeader: 700,
        deltaToNext: 490,
        capturedAt: now,
      },
      {
        id: "leader-sudoku-season-mio",
        periodType: "SEASON",
        gameId: "game-sudoku",
        userId: "user-mio",
        rank: 3,
        points: 320,
        deltaToLeader: 1190,
        deltaToNext: null,
        capturedAt: now,
      },
    ],
  };
}

let devState = createInitialState();

function clone<T>(value: T): T {
  return structuredClone(value);
}

function getUser(userId: string) {
  return devState.users.find((user) => user.id === userId) ?? null;
}

function requireUser(userId: string) {
  const user = getUser(userId);

  if (!user) {
    throw new Error(`Missing development fixture user: ${userId}`);
  }

  return user;
}

function getProfile(userId: string) {
  return devState.profiles.find((profile) => profile.userId === userId) ?? null;
}

function getGame(gameId: string) {
  return devState.games.find((game) => game.id === gameId) ?? null;
}

function requireGame(gameId: string) {
  const game = getGame(gameId);

  if (!game) {
    throw new Error(`Missing development fixture game: ${gameId}`);
  }

  return game;
}

function buildUserRecord(userId: string, playResultLimit?: number) {
  const user = getUser(userId);

  if (!user) {
    return null;
  }

  const playResults = devState.playResults
    .filter((result) => result.userId === userId)
    .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
    .slice(0, playResultLimit ?? Number.POSITIVE_INFINITY)
    .map((result) => ({
      ...result,
      game: requireGame(result.gameId),
    }));

  return clone({
    ...user,
    profile: getProfile(userId),
    overallSummaries: devState.overallSummaries
      .filter((summary) => summary.userId === userId)
      .sort((left, right) => left.periodType.localeCompare(right.periodType)),
    gameSummaries: devState.gameSummaries
      .filter((summary) => summary.userId === userId)
      .sort((left, right) => {
        const leftGame = requireGame(left.gameId).name;
        const rightGame = requireGame(right.gameId).name;
        return leftGame.localeCompare(rightGame);
      })
      .map((summary) => ({
        ...summary,
        game: requireGame(summary.gameId),
      })),
    playResults,
  });
}

function getFallbackMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function canUseDevelopmentFixtures(error: unknown) {
  if (runtimeConfig.environment === "production" || runtimeConfig.hostingTarget === "azure") {
    return false;
  }

  const message = getFallbackMessage(error);

  return [
    "Login failed for user",
    "Can't reach database server",
    "ECONNREFUSED",
    "server was not found",
  ].some((fragment) => message.toLowerCase().includes(fragment.toLowerCase()));
}

export async function withDevelopmentFixtures<T>(run: () => Promise<T>, fallback: () => T | Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if (!canUseDevelopmentFixtures(error)) {
      throw error;
    }

    return fallback();
  }
}

export function listSignInUsersFixture() {
  return devState.users
    .slice()
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
    .map((user) => ({
      ...clone(user),
      profile: clone(getProfile(user.id)),
      overallSummaries: devState.overallSummaries.filter((summary) => summary.userId === user.id && summary.periodType === "SEASON"),
      gameSummaries: devState.gameSummaries
        .filter((summary) => summary.userId === user.id)
        .map((summary) => ({
          ...clone(summary),
          game: clone(requireGame(summary.gameId)),
        })),
    }));
}

export function getHomeDashboardRecordFixture(userId: string) {
  return buildUserRecord(userId, 5);
}

export function getProfileRecordFixture(userId: string) {
  return buildUserRecord(userId, 12);
}

export function getGameRecordFixture(gameKey: string) {
  const game = devState.games.find((entry) => entry.key === toStoredGameKey(gameKey));
  return game ? clone(game) : null;
}

export function listGameRecordsFixture() {
  return clone(devState.games.slice().sort((left, right) => left.name.localeCompare(right.name)));
}

export function listRankingGamesFixture() {
  return listGameRecordsFixture();
}

export function listUsersWithResultsFixture() {
  return devState.users.map((user) => ({
    ...clone(user),
    playResults: devState.playResults
      .filter((result) => result.userId === user.id && (result.status === "COMPLETED" || result.status === "PENDING_SAVE"))
      .sort((left, right) => (right.finishedAt?.getTime() ?? 0) - (left.finishedAt?.getTime() ?? 0))
      .map((result) => clone(result)),
  }));
}

export function createPlayResultRecordFixture(input: {
  id: string;
  userId: string;
  gameId: string;
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  status: "COMPLETED" | "FAILED" | "ABANDONED" | "PENDING_SAVE";
  cleared: boolean;
  leaderboardEligible: boolean;
  primaryMetric: number;
  secondaryMetric?: number | null;
  hintCount?: number | null;
  mistakeCount?: number | null;
  competitivePoints: number;
  totalPointsDelta?: number;
  rankDelta?: number | null;
  isPersonalBest?: boolean;
  summaryText: string;
  sharePath?: string | null;
  shareToken?: string | null;
}) {
  const now = new Date();
  const nextResult: DevPlayResult = {
    id: input.id,
    userId: input.userId,
    gameId: input.gameId,
    difficulty: input.difficulty,
    startedAt: now,
    finishedAt: now,
    status: input.status,
    cleared: input.cleared,
    leaderboardEligible: input.leaderboardEligible,
    primaryMetric: input.primaryMetric,
    secondaryMetric: input.secondaryMetric ?? null,
    hintCount: input.hintCount ?? null,
    mistakeCount: input.mistakeCount ?? null,
    competitivePoints: input.competitivePoints,
    totalPointsDelta: input.totalPointsDelta ?? 0,
    rankDelta: input.rankDelta ?? null,
    isPersonalBest: input.isPersonalBest ?? false,
    summaryText: input.summaryText,
    sharePath: input.sharePath ?? null,
    shareToken: input.shareToken ?? null,
  };

  devState.playResults.unshift(nextResult);

  const profile = getProfile(input.userId);
  if (profile) {
    profile.totalPlayCount += 1;
    profile.lastPlayedAt = now;
    profile.streakDays = Math.max(profile.streakDays, 1);
  }

  return clone(nextResult);
}

export function updatePlayResultStatusFixture(resultId: string, input: {
  status: "COMPLETED" | "FAILED" | "ABANDONED" | "PENDING_SAVE";
  leaderboardEligible: boolean;
  totalPointsDelta: number;
  rankDelta: number | null;
  summaryText: string;
}) {
  const result = devState.playResults.find((entry) => entry.id === resultId);

  if (!result) {
    throw new Response("Result not found", { status: 404 });
  }

  result.status = input.status;
  result.leaderboardEligible = input.leaderboardEligible;
  result.totalPointsDelta = input.totalPointsDelta;
  result.rankDelta = input.rankDelta;
  result.summaryText = input.summaryText;
  result.finishedAt = new Date();

  return clone(result);
}

export function replaceLeaderboardEntriesFixture(entries: Array<{
  periodType: RankingPeriod;
  gameId?: string;
  userId: string;
  rank: number;
  points: number;
  deltaToLeader: number | null;
  deltaToNext: number | null;
}>) {
  const now = new Date();
  devState.leaderboardEntries = entries.map((entry) => ({
    id: `leader-${entry.periodType}-${entry.gameId ?? "overall"}-${entry.userId}`,
    periodType: entry.periodType,
    gameId: entry.gameId ?? null,
    userId: entry.userId,
    rank: entry.rank,
    points: entry.points,
    deltaToLeader: entry.deltaToLeader,
    deltaToNext: entry.deltaToNext,
    capturedAt: now,
  }));
}

export function replaceUserGameSummariesFixture(summaries: Array<{
  userId: string;
  gameId: string;
  currentRank: number | null;
  bestCompetitivePoints: number;
  personalBestMetric: number | null;
  playCount: number;
  completedCount: number;
  lastPlayedAt: Date | null;
  recommendationText: string | null;
}>) {
  devState.gameSummaries = summaries.map((summary) => ({
    id: `game-summary-${summary.userId}-${summary.gameId}`,
    userId: summary.userId,
    gameId: summary.gameId,
    currentRank: summary.currentRank,
    bestCompetitivePoints: summary.bestCompetitivePoints,
    personalBestMetric: summary.personalBestMetric,
    playCount: summary.playCount,
    completedCount: summary.completedCount,
    lastPlayedAt: summary.lastPlayedAt,
    recommendationText: summary.recommendationText,
  }));
}

export function replaceUserOverallSummariesFixture(summaries: Array<{
  userId: string;
  periodType: RankingPeriod;
  totalPoints: number;
  currentRank: number | null;
  trendDelta: number;
  recentPlaySummary: string | null;
}>) {
  const now = new Date();
  devState.overallSummaries = summaries.map((summary) => ({
    id: `overall-summary-${summary.userId}-${summary.periodType}`,
    userId: summary.userId,
    periodType: summary.periodType,
    totalPoints: summary.totalPoints,
    currentRank: summary.currentRank,
    trendDelta: summary.trendDelta,
    recentPlaySummary: summary.recentPlaySummary,
    updatedAt: now,
  }));
}

export function listLeaderboardEntriesFixture(periodType: RankingPeriod, scope: RankingScope) {
  return devState.leaderboardEntries
    .filter((entry) => {
      if (entry.periodType !== periodType) {
        return false;
      }

      if (scope === "overall") {
        return entry.gameId === null;
      }

      if (!entry.gameId) {
        return false;
      }

      return requireGame(entry.gameId).key === toStoredGameKey(scope);
    })
    .filter((entry) => requireUser(entry.userId).visibilityScope === "TENANT_ONLY")
    .sort((left, right) => left.rank - right.rank)
    .map((entry) => ({
      ...clone(entry),
      user: clone(requireUser(entry.userId)),
      game: entry.gameId ? clone(requireGame(entry.gameId)) : null,
    }));
}

export function getPlayResultByIdFixture(resultId: string) {
  const result = devState.playResults.find((entry) => entry.id === resultId);

  if (!result) {
    return null;
  }

  return clone({
    ...result,
    game: requireGame(result.gameId),
    user: {
      ...requireUser(result.userId),
      profile: getProfile(result.userId),
      playResults: devState.playResults
        .filter((entry) => entry.userId === result.userId)
        .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
        .map((entry) => ({
          ...entry,
          game: requireGame(entry.gameId),
        })),
    },
  });
}

export function getPlayResultByShareTokenFixture(shareToken: string) {
  const result = devState.playResults.find((entry) => entry.shareToken === shareToken);
  return result ? getPlayResultByIdFixture(result.id) : null;
}

export function updatePlayResultShareTokenFixture(resultId: string, shareToken: string) {
  const result = devState.playResults.find((entry) => entry.id === resultId);

  if (!result) {
    throw new Response("Result not found", { status: 404 });
  }

  result.shareToken = shareToken;
  result.sharePath = `/results/shared/${shareToken}`;
  return clone(result);
}

export function updateProfileRecordFixture(input: {
  userId: string;
  displayName: string;
  visibilityScope: VisibilityScope;
  tagline: string;
  favoriteGame: FavoriteGame;
  themePreference: "LIGHT" | "DARK";
}) {
  const user = getUser(input.userId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  user.displayName = input.displayName.trim();
  user.visibilityScope = input.visibilityScope;

  const existingProfile = getProfile(input.userId);
  const trimmedTagline = input.tagline.trim();

  if (existingProfile) {
    existingProfile.tagline = trimmedTagline || null;
    existingProfile.favoriteGame = input.favoriteGame;
    existingProfile.themePreference = input.themePreference;
  } else {
    devState.profiles.push({
      userId: input.userId,
      tagline: trimmedTagline || null,
      favoriteGame: input.favoriteGame,
      themePreference: input.themePreference,
      streakDays: 0,
      totalPlayCount: 0,
      lastPlayedAt: null,
    });
  }

  return clone(user);
}

export function markOnboardingSeenFixture(userId: string) {
  const user = getUser(userId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  if (!user.onboardingSeenAt) {
    user.onboardingSeenAt = new Date();
  }

  return clone(user);
}

export function getThemePreferenceByUserIdFixture(userId: string) {
  return getProfile(userId)?.themePreference ?? "LIGHT";
}

export function resetDevelopmentFixtures() {
  devState = createInitialState();
}
