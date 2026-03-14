import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { pickDistinctIndices, randomInt, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type DifferenceKind = "color" | "rotation" | "offset" | "missing";

type SpotChangeAppearance = {
  accent: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  symbol: string;
};

export type SpotChangeCell = {
  changed: SpotChangeAppearance;
  differenceKind: DifferenceKind | null;
  id: string;
  isDifference: boolean;
  isFound: boolean;
  original: SpotChangeAppearance;
};

type SpotChangeRound = {
  board: SpotChangeCell[][];
  differenceCount: number;
  foundCount: number;
};

type DifficultyConfig = {
  columnCount: number;
  maxDifferenceCount: number;
  roundCount: number;
  rowCount: number;
  startingDifferenceCount: number;
  timeLimitSeconds: number;
};

const symbols = ["▲", "◆", "●", "■", "✦", "✿", "⬢", "✚", "☼", "✳"] as const;
const accents = ["#f97316", "#38bdf8", "#f43f5e", "#22c55e", "#facc15", "#c084fc"] as const;
const differenceKinds = ["color", "rotation", "offset", "missing"] as const satisfies readonly DifferenceKind[];

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 4, maxDifferenceCount: 3, roundCount: 4, rowCount: 3, startingDifferenceCount: 2, timeLimitSeconds: 42 },
  NORMAL: { columnCount: 5, maxDifferenceCount: 3, roundCount: 5, rowCount: 3, startingDifferenceCount: 2, timeLimitSeconds: 52 },
  HARD: { columnCount: 5, maxDifferenceCount: 4, roundCount: 5, rowCount: 4, startingDifferenceCount: 3, timeLimitSeconds: 64 },
  EXPERT: { columnCount: 6, maxDifferenceCount: 5, roundCount: 6, rowCount: 4, startingDifferenceCount: 3, timeLimitSeconds: 76 },
};

function getDifferenceCount(config: DifficultyConfig, roundIndex: number) {
  return Math.min(config.maxDifferenceCount, config.startingDifferenceCount + Math.floor(roundIndex / 2));
}

function createBaseAppearance(seed: number): SpotChangeAppearance {
  return {
    accent: accents[seed % accents.length],
    offsetX: (seed % 3) - 1,
    offsetY: ((seed + 1) % 3) - 1,
    rotation: [-14, -7, 0, 7, 14][seed % 5],
    symbol: symbols[seed % symbols.length],
  };
}

function getAlternateAccent(accent: string, seed: number) {
  const currentIndex = accents.indexOf(accent as (typeof accents)[number]);
  const nextIndex = currentIndex === -1 ? seed % accents.length : (currentIndex + 2 + seed) % accents.length;

  return accents[nextIndex];
}

function applyDifference(appearance: SpotChangeAppearance, differenceKind: DifferenceKind, seed: number): SpotChangeAppearance {
  if (differenceKind === "color") {
    return {
      ...appearance,
      accent: getAlternateAccent(appearance.accent, seed),
    };
  }

  if (differenceKind === "rotation") {
    return {
      ...appearance,
      rotation: appearance.rotation + (seed % 2 === 0 ? 38 : -38),
    };
  }

  if (differenceKind === "offset") {
    return {
      ...appearance,
      offsetX: seed % 2 === 0 ? 10 : -10,
      offsetY: seed % 3 === 0 ? 8 : -8,
    };
  }

  return {
    ...appearance,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    symbol: "",
  };
}

function createRound(config: DifficultyConfig, roundIndex: number, preview = false): SpotChangeRound {
  const totalCellCount = config.rowCount * config.columnCount;
  const differenceCount = preview ? Math.min(2, getDifferenceCount(config, roundIndex)) : getDifferenceCount(config, roundIndex);
  const differenceIndices = preview
    ? Array.from({ length: differenceCount }, (_, index) => Math.min(totalCellCount - 1, index * 3 + 1))
    : pickDistinctIndices(totalCellCount, differenceCount);
  const differenceIndexSet = new Set(differenceIndices);
  const assignedKinds = preview
    ? differenceIndices.map((_, index) => differenceKinds[index % differenceKinds.length])
    : shuffleValues(differenceKinds).slice(0, differenceCount);
  const differenceKindByIndex = new Map<number, DifferenceKind>(
    differenceIndices.map((differenceIndex, index) => [differenceIndex, assignedKinds[index % assignedKinds.length]]),
  );

  const board = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const flatIndex = rowIndex * config.columnCount + columnIndex;
      const seed = preview ? roundIndex * 13 + flatIndex : roundIndex * 29 + flatIndex * 7 + randomInt(17);
      const original = createBaseAppearance(seed);
      const differenceKind = differenceKindByIndex.get(flatIndex) ?? null;

      return {
        changed: differenceKind ? applyDifference(original, differenceKind, seed + 3) : original,
        differenceKind,
        id: `${preview ? "spot-preview" : "spot-live"}-${roundIndex}-${rowIndex}-${columnIndex}`,
        isDifference: differenceIndexSet.has(flatIndex),
        isFound: false,
        original,
      };
    }),
  );

  return {
    board,
    differenceCount,
    foundCount: 0,
  };
}

function markFound(round: SpotChangeRound, rowIndex: number, columnIndex: number) {
  const cell = round.board[rowIndex]?.[columnIndex];

  if (!cell || !cell.isDifference || cell.isFound) {
    return null;
  }

  const board = round.board.map((row, nextRowIndex) =>
    row.map((currentCell, nextColumnIndex) =>
      nextRowIndex === rowIndex && nextColumnIndex === columnIndex
        ? { ...currentCell, isFound: true }
        : currentCell,
    ),
  );

  return {
    board,
    differenceCount: round.differenceCount,
    foundCount: round.foundCount + 1,
  };
}

export function useSpotChangeSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewRound = useMemo(() => createRound(config, 0, true), [config]);
  const [currentRound, setCurrentRound] = useState<SpotChangeRound>(previewRound);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setCurrentRound(previewRound);
    setElapsedSeconds(0);
    setMissCount(0);
    setRoundIndex(0);
    setState("idle");
  }, [config, previewRound]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    setCurrentRound(createRound(config, 0));
    setElapsedSeconds(0);
    setMissCount(0);
    setRoundIndex(0);
    setState("playing");
  }

  function pressChangedCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const cell = currentRound.board[rowIndex]?.[columnIndex];

    if (!cell) {
      return "ignored" as const;
    }

    if (!cell.isDifference) {
      setMissCount((current) => current + 1);
      return "wrong" as const;
    }

    if (cell.isFound) {
      return "already-found" as const;
    }

    const nextRound = markFound(currentRound, rowIndex, columnIndex);

    if (!nextRound) {
      return "ignored" as const;
    }

    if (nextRound.foundCount >= nextRound.differenceCount) {
      const nextRoundIndex = roundIndex + 1;

      if (nextRoundIndex >= config.roundCount) {
        setCurrentRound(nextRound);
        setRoundIndex(nextRoundIndex);
        setState("cleared");
        return "correct" as const;
      }

      setCurrentRound(createRound(config, nextRoundIndex));
      setRoundIndex(nextRoundIndex);
      return "correct" as const;
    }

    setCurrentRound(nextRound);
    return "correct" as const;
  }

  return {
    beginRun,
    currentRound,
    elapsedSeconds,
    missCount,
    pressChangedCell,
    roundCount: config.roundCount,
    roundIndex,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
