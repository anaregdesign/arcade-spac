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
    homeTags: ["perception", "fast-start"],
    key: "color-sweep",
    name: "Color Sweep",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
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
    homeTags: ["fast-start", "logic"],
    key: "minesweeper",
    name: "Minesweeper",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
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
    homeTags: ["logic"],
    key: "sudoku",
    name: "Sudoku",
    primaryMetric: {
      bestLabel: "Best solve time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
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
    homeTags: ["timing", "fast-start"],
    key: "drop-line",
    name: "Drop Line",
    primaryMetric: {
      bestLabel: "Best hit offset",
      completedLabel: "Hit offset",
      direction: "lower-better",
      failedLabel: "Miss offset",
      format: "offset_px",
    },
    storedKey: "DROP_LINE",
    successfulResultLabel: "hit",
    supportMetric: {
      kind: "drop-line-rating",
      label: "Hit rating",
    },
  },
] as const satisfies ReadonlyArray<{
  homeTags: readonly string[];
  key: string;
  name: string;
  primaryMetric: GamePrimaryMetricDefinition;
  storedKey: string;
  successfulResultLabel: string;
  supportMetric: GameSupportMetricDefinition;
}>;

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
