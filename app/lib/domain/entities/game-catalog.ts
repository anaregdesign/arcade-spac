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

type PrecisionDropRatingSupportMetricDefinition = {
  kind: "precision-drop-rating";
  label: "Hit rating";
};

type GameSupportMetricDefinition = CountSupportMetricDefinition | PrecisionDropRatingSupportMetricDefinition;

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
    id: "game-precision-drop",
    key: "precision-drop",
    name: "Precision Drop",
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
      kind: "precision-drop-rating",
      label: "Hit rating",
    },
  },
  {
    accentColor: "#2563eb",
    homeTags: ["timing", "fast-start"],
    id: "game-orbit-tap",
    key: "orbit-tap",
    name: "Orbit Tap",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Hit the gate repeatedly before the timer expires. Misses lower quality, and timeouts stay in history only.",
    shortDescription: "Tap when the orbit marker crosses the gate and chain enough hits to clear the run.",
    storedKey: "ORBIT_TAP",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Misses",
      noun: "miss",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Clean orbit kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no misses",
      zeroNote: "Clean orbit",
    },
  },
  {
    accentColor: "#ef4444",
    homeTags: ["reflex", "timing"],
    id: "game-target-trail",
    key: "target-trail",
    name: "Target Trail",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Only the live target advances the trail. Misses lower quality, and timeouts stay in history only.",
    shortDescription: "Chase the active target across the board and finish the trail before the timer expires.",
    storedKey: "TARGET_TRAIL",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Misses",
      noun: "miss",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect trail kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no misses",
      zeroNote: "Perfect trail",
    },
  },
  {
    accentColor: "#10b981",
    homeTags: ["memory", "logic"],
    id: "game-path-recall",
    key: "path-recall",
    name: "Path Recall",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Watch the path, replay it in order, and keep wrong cells low before the timer expires.",
    shortDescription: "Memorize the highlighted path, then retrace it cell by cell from memory.",
    storedKey: "PATH_RECALL",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong cells",
      noun: "wrong cell",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Clean recall kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong cells",
      zeroNote: "Clean recall",
    },
  },
  {
    accentColor: "#6366f1",
    homeTags: ["memory", "perception"],
    id: "game-pulse-count",
    key: "pulse-count",
    name: "Pulse Count",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Count the pulses, answer quickly, and keep wrong answers low before the timer expires.",
    shortDescription: "Watch the signal pulse, then choose the right count across a short answer sprint.",
    storedKey: "PULSE_COUNT",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong answers",
      noun: "wrong answer",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect count kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong answers",
      zeroNote: "Perfect count",
    },
  },
  {
    accentColor: "#f59e0b",
    homeTags: ["logic", "fast-start"],
    id: "game-quick-sum",
    key: "quick-sum",
    name: "Quick Sum",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Solve each prompt fast. Wrong answers lower quality, and timeouts stay in history only.",
    shortDescription: "Clear a rapid run of arithmetic prompts by choosing the right answer each round.",
    storedKey: "QUICK_SUM",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong answers",
      noun: "wrong answer",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect sum kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong answers",
      zeroNote: "Perfect sum",
    },
  },
  {
    accentColor: "#22c55e",
    homeTags: ["perception", "fast-start"],
    id: "game-symbol-hunt",
    key: "symbol-hunt",
    name: "Symbol Hunt",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Only the target symbol counts. Wrong taps lower quality, and timeouts stay in history only.",
    shortDescription: "Find every copy of the target symbol hidden in the noisy board before time runs out.",
    storedKey: "SYMBOL_HUNT",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Wrong taps",
      noun: "wrong tap",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Perfect hunt kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no wrong taps",
      zeroNote: "Perfect hunt",
    },
  },
  {
    accentColor: "#06b6d4",
    homeTags: ["logic"],
    id: "game-light-grid",
    key: "light-grid",
    name: "Light Grid",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Toggle the board into the target state. Extra moves lower quality, and timeouts stay in history only.",
    shortDescription: "Flip the light grid until the live board matches the target pattern.",
    storedKey: "LIGHT_GRID",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Moves",
      noun: "move",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Zero-move solve kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no moves",
      zeroNote: "Zero-move solve",
    },
  },
  {
    accentColor: "#a855f7",
    homeTags: ["logic", "spatial"],
    id: "game-tile-shift",
    key: "tile-shift",
    name: "Tile Shift",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Shift rows and columns into place. Extra moves lower quality, and timeouts stay in history only.",
    shortDescription: "Rotate rows and columns until the live pattern matches the target board.",
    storedKey: "TILE_SHIFT",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Moves",
      noun: "move",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Zero-move shift kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no moves",
      zeroNote: "Zero-move shift",
    },
  },
  {
    accentColor: "#2563eb",
    homeTags: ["logic", "spatial"],
    id: "game-swap-solve",
    key: "swap-solve",
    name: "Swap Solve",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Swap two tiles at a time until the live board matches the target. Extra swaps lower quality, and failed boards stay in history only.",
    shortDescription: "Restore the scrambled board by swapping pairs of tiles before the swap budget or timer runs out.",
    storedKey: "SWAP_SOLVE",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Swaps",
      noun: "swap",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Zero-swap solve kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no swaps",
      zeroNote: "Zero-swap solve",
    },
  },
  {
    accentColor: "#fb7185",
    homeTags: ["logic", "spatial"],
    id: "game-stack-sort",
    key: "stack-sort",
    name: "Stack Sort",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Sort the stacks fast. Extra moves lower quality, and timeouts stay in history only.",
    shortDescription: "Move the top token between stacks until each stack holds only one color.",
    storedKey: "STACK_SORT",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Moves",
      noun: "move",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Zero-move sort kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no moves",
      zeroNote: "Zero-move sort",
    },
  },
  {
    accentColor: "#84cc16",
    homeTags: ["memory", "spatial"],
    id: "game-mirror-match",
    key: "mirror-match",
    name: "Mirror Match",
    primaryMetric: {
      bestLabel: "Best clear time",
      completedLabel: "Clear time",
      direction: "lower-better",
      failedLabel: "Run time",
      format: "duration_seconds",
    },
    rulesSummary: "Mirror the target board quickly. Extra moves lower quality, and timeouts stay in history only.",
    shortDescription: "Rebuild the mirrored target pattern on the editable grid before the timer expires.",
    storedKey: "MIRROR_MATCH",
    successfulResultLabel: "clear",
    supportMetric: {
      kind: "count",
      label: "Moves",
      noun: "move",
      noteVerb: "recorded",
      recoveryVerb: "kept in recovery",
      recoveryZeroNote: "Zero-move mirror kept in recovery.",
      source: "mistakeCount",
      zeroSummaryText: "no moves",
      zeroNote: "Zero-move mirror",
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

const gameDefinitionByKey = new Map(supportedGames.map((game) => [game.key, game] as const));
const legacyRouteKeyByAlias = new Map<string, GameKey>([
  ["drop-ball", "precision-drop"],
  ["drop-line", "precision-drop"],
]);

export function isGameKey(value: string): value is GameKey {
  return gameDefinitionByKey.has(value as GameKey);
}

export function resolveGameKey(value: string): GameKey | null {
  const normalizedRouteKey = value.toLowerCase().replace(/_/g, "-");

  if (gameDefinitionByKey.has(normalizedRouteKey as GameKey)) {
    return normalizedRouteKey as GameKey;
  }

  return legacyRouteKeyByAlias.get(normalizedRouteKey) ?? null;
}

export function toStoredGameKey(gameKey: GameKey): StoredGameKey;
export function toStoredGameKey(gameKey: string): string;
export function toStoredGameKey(gameKey: string) {
  const resolvedGameKey = resolveGameKey(gameKey);

  if (!resolvedGameKey) {
    return gameKey.toUpperCase().replace(/-/g, "_");
  }

  return gameDefinitionByKey.get(resolvedGameKey)!.storedKey;
}

export function toRouteGameKey(gameKey: StoredGameKey): GameKey;
export function toRouteGameKey(gameKey: string): string;
export function toRouteGameKey(gameKey: string) {
  return resolveGameKey(gameKey) ?? gameKey.toLowerCase().replace(/_/g, "-");
}

export function getGameDefinition(gameKey: string) {
  const normalizedKey = resolveGameKey(gameKey);
  return normalizedKey ? gameDefinitionByKey.get(normalizedKey) ?? null : null;
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
  const normalizedCurrentGameKey = toRouteGameKey(currentGameKey);

  return supportedGames
    .filter((game) => game.key !== normalizedCurrentGameKey)
    .map((game) => ({
      href: `/games/${game.key}`,
      key: game.key,
      label: `Play ${game.name}`,
    }));
}
