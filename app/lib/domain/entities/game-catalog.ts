type CountSupportMetricSource = "hintCount" | "mistakeCount";

type CountSupportMetricDefinition = {
  kind: "count";
  label: string;
  noun: string;
  noteVerb: string;
  recoveryVerb: string;
  recoveryZeroNote: string;
  source: CountSupportMetricSource;
  zeroSummaryText: string;
  zeroNote: string;
};

type DropLineRatingSupportMetricDefinition = {
  kind: "drop-line-rating";
  label: "Hit rating";
};

type GameSupportMetricDefinition = CountSupportMetricDefinition | DropLineRatingSupportMetricDefinition;

type GamePrimaryMetricDefinition = {
  bestLabel: string;
  completedLabel: string;
  direction: "lower-better";
  failedLabel: string;
  format: "duration_seconds" | "offset_px";
};

export const supportedGames = [
  {
    accentColor: "#14b8a6",
    homeTags: ["perception", "fast-start"],
    id: "game-color-sweep",
    key: "color-sweep",
    name: "Color Sweep",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Only the target color counts. Wrong taps lower quality, and timeouts stay in history only.",
    shortDescription: "Clear every tile that matches the target color before the timer expires.",
    storedKey: "COLOR_SWEEP",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong taps",
      noun: "wrong tap",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect sweep kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong taps",
      zeroNote: "Perfect sweep",
    },
  },
  {
    accentColor: "#ea580c",
    homeTags: ["fast-start", "logic"],
    id: "game-minesweeper",
    key: "minesweeper",
    name: "Minesweeper",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Reveal all safe tiles. Mistakes cost quality score and leaderboard points.",
    shortDescription: "Clear the board quickly while keeping mistakes low.",
    storedKey: "MINESWEEPER",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Mistakes",
      noun: "mistake",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Clean board kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no mistakes",
      zeroNote: "Clean board",
    },
  },
  {
    accentColor: "#3b82f6",
    homeTags: ["logic", "fast-start"],
    id: "game-number-chain",
    key: "number-chain",
    name: "Number Chain",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Only the next number advances the chain. Wrong taps lower quality, and timeouts stay in history only.",
    shortDescription: "Tap the shuffled numbers in ascending order before the timer expires.",
    storedKey: "NUMBER_CHAIN",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong taps",
      noun: "wrong tap",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect chain kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong taps",
      zeroNote: "Perfect chain",
    },
  },
  {
    accentColor: "#7c3aed",
    homeTags: ["memory"],
    id: "game-pair-flip",
    key: "pair-flip",
    name: "Pair Flip",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Mismatched cards flip back after a short reveal. Timeouts stay in history only.",
    shortDescription: "Flip cards two at a time and match every symbol before the timer expires.",
    storedKey: "PAIR_FLIP",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Mismatches",
      noun: "mismatch",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect memory kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no mismatches",
      zeroNote: "Perfect memory",
    },
  },
  {
    accentColor: "#0f766e",
    homeTags: ["logic"],
    id: "game-sudoku",
    key: "sudoku",
    name: "Sudoku",
    primaryMetric: {
      bestLabel: "Best solve time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Finish the puzzle fast. Hints lower quality and can remove leaderboard eligibility.",
    shortDescription: "Complete the grid with as few hints and errors as possible.",
    storedKey: "SUDOKU",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Hints used",
      noun: "hint",
      noteVerb: "used",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "No hints recorded in recovery.",
      source: "hintCount",
      zeroSummaryText: "no hints",
      zeroNote: "No hints needed",
    },
  },
  {
    accentColor: "#8b5cf6",
    homeTags: ["memory", "rhythm"],
    id: "game-pattern-echo",
    key: "pattern-echo",
    name: "Pattern Echo",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Wrong inputs count against quality but do not stop the run. Timeouts stay in history only.",
    shortDescription: "Watch the pad sequence flash, then reproduce it in the exact same order.",
    storedKey: "PATTERN_ECHO",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong inputs",
      noun: "wrong input",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect recall kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong inputs",
      zeroNote: "Perfect recall",
    },
  },
  {
    accentColor: "#f97316",
    homeTags: ["timing", "fast-start"],
    id: "game-drop-line",
    key: "drop-line",
    name: "Drop Ball",
    primaryMetric: {
      bestLabel: "Best hit offset",
      completedLabel: "Hit offset",
      direction: "lower-better",
      failedLabel: "Miss offset",
      format: "offset_px",
    },
    rulesSummary: "A smaller hit offset scores better. Missed drops stay in history only and do not enter rankings.",
    shortDescription: "Tap when the falling ball overlaps the target line to keep the offset tiny.",
    storedKey: "DROP_LINE",
    successfulResultLabel: "hit",
    supportMetric: {
      kind: "drop-line-rating",
      label: "Hit rating",
    },
  },
] as const satisfies ReadonlyArray<{
  accentColor: string;
  homeTags: readonly string[];
  id: string;
  key: string;
  name: string;
  primaryMetric: GamePrimaryMetricDefinition;
  rulesSummary: string;
  shortDescription: string;
  storedKey: string;
  successfulResultLabel: string;
  supportMetric: GameSupportMetricDefinition;
}>;

export function listPersistedGames() {
  return supportedGames.map((game) => ({
    id: game.id,
    key: game.storedKey,
    name: game.name,
    shortDescription: game.shortDescription,
    accentColor: game.accentColor,
    rulesSummary: game.rulesSummary,
  }));
}

export type GameKey = (typeof supportedGames)[number]["key"];
export type StoredGameKey = (typeof supportedGames)[number]["storedKey"];
export type GameDefinition = (typeof supportedGames)[number];
export type GameLink = {
  href: string;
  key: GameKey;
  label: string;
};

export function isGameKey(value: string): value is GameKey {
  return supportedGames.some((game) => game.key === value);
}

export function toStoredGameKey(gameKey: GameKey): StoredGameKey;
export function toStoredGameKey(gameKey: string): string;
export function toStoredGameKey(gameKey: string) {
  return gameKey.toUpperCase().replace(/-/g, "_");
}

export function toRouteGameKey(gameKey: StoredGameKey): GameKey;
export function toRouteGameKey(gameKey: string): string;
export function toRouteGameKey(gameKey: string) {
  return gameKey.toLowerCase().replace(/_/g, "-");
}

export function getGameDefinition(gameKey: string) {
  const normalizedKey = toRouteGameKey(gameKey);
  return supportedGames.find((game) => game.key === normalizedKey) ?? null;
}

export function getGameName(gameKey: string) {
  return getGameDefinition(gameKey)?.name ?? gameKey;
}

export function getGameHomeTags(gameKey: string) {
  return getGameDefinition(gameKey)?.homeTags ?? [];
}

export function getGameSuccessfulResultLabel(gameKey: string) {
  return getGameDefinition(gameKey)?.successfulResultLabel ?? "clear";
}

export function buildAlternateGameLinks(currentGameKey: string): GameLink[] {
  return supportedGames
    .filter((game) => game.key !== currentGameKey)
    .map((game) => ({
      href: `/games/${game.key}`,
      key: game.key,
      label: `Play ${game.name}`,
    }));
}
