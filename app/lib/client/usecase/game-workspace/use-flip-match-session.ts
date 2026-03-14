import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { areBooleanGridsEqual, cloneBooleanGrid, createBooleanGrid, randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type FlipMatchRound = {
  liveGrid: boolean[][];
  targetGrid: boolean[][];
};

type DifficultyConfig = {
  baseScrambleCount: number;
  columnCount: number;
  maxScrambleCount: number;
  roundCount: number;
  rowCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { baseScrambleCount: 3, columnCount: 3, maxScrambleCount: 4, roundCount: 3, rowCount: 3, timeLimitSeconds: 40 },
  NORMAL: { baseScrambleCount: 4, columnCount: 4, maxScrambleCount: 6, roundCount: 4, rowCount: 3, timeLimitSeconds: 52 },
  HARD: { baseScrambleCount: 5, columnCount: 4, maxScrambleCount: 7, roundCount: 5, rowCount: 4, timeLimitSeconds: 66 },
  EXPERT: { baseScrambleCount: 6, columnCount: 5, maxScrambleCount: 8, roundCount: 6, rowCount: 4, timeLimitSeconds: 80 },
};

function toggleHorizontalStrip(grid: boolean[][], rowIndex: number, columnIndex: number) {
  const offsets = [-1, 0, 1];

  for (const offset of offsets) {
    const nextColumnIndex = columnIndex + offset;

    if (grid[rowIndex]?.[nextColumnIndex] === undefined) {
      continue;
    }

    grid[rowIndex][nextColumnIndex] = !grid[rowIndex][nextColumnIndex];
  }
}

function getScrambleCount(config: DifficultyConfig, roundIndex: number) {
  return Math.min(config.maxScrambleCount, config.baseScrambleCount + Math.floor(roundIndex / 2));
}

function buildTargetGrid(config: DifficultyConfig, roundIndex: number, preview = false) {
  const targetGrid = createBooleanGrid(config.rowCount, config.columnCount);
  const patternCount = preview ? 3 : 2 + Math.floor(roundIndex / 2);

  for (let index = 0; index < patternCount; index += 1) {
    const rowIndex = preview
      ? [0, Math.floor(config.rowCount / 2), config.rowCount - 1][index % 3]
      : randomInt(config.rowCount);
    const columnIndex = preview
      ? [0, Math.floor(config.columnCount / 2), config.columnCount - 1][(index + 1) % 3]
      : randomInt(config.columnCount);

    toggleHorizontalStrip(targetGrid, rowIndex, columnIndex);
  }

  if (targetGrid.every((row) => row.every((cell) => !cell))) {
    toggleHorizontalStrip(targetGrid, Math.floor(config.rowCount / 2), Math.floor(config.columnCount / 2));
  }

  return targetGrid;
}

function buildLiveGrid(targetGrid: boolean[][], config: DifficultyConfig, roundIndex: number, preview = false) {
  const liveGrid = cloneBooleanGrid(targetGrid);
  const scrambleCount = preview ? Math.max(2, config.baseScrambleCount - 1) : getScrambleCount(config, roundIndex);

  for (let index = 0; index < scrambleCount; index += 1) {
    const rowIndex = preview
      ? [0, config.rowCount - 1, Math.floor(config.rowCount / 2)][index % 3]
      : randomInt(config.rowCount);
    const columnIndex = preview
      ? [config.columnCount - 1, 0, Math.floor(config.columnCount / 2)][index % 3]
      : randomInt(config.columnCount);

    toggleHorizontalStrip(liveGrid, rowIndex, columnIndex);
  }

  if (areBooleanGridsEqual(liveGrid, targetGrid)) {
    toggleHorizontalStrip(liveGrid, Math.floor(config.rowCount / 2), Math.floor(config.columnCount / 2));
  }

  return liveGrid;
}

function createRound(config: DifficultyConfig, roundIndex: number, preview = false): FlipMatchRound {
  const targetGrid = buildTargetGrid(config, roundIndex, preview);

  return {
    liveGrid: buildLiveGrid(targetGrid, config, roundIndex, preview),
    targetGrid,
  };
}

export function useFlipMatchSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewRound = useMemo(() => createRound(config, 0, true), [config]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [flipCount, setFlipCount] = useState(0);
  const [liveGrid, setLiveGrid] = useState<boolean[][]>(() => previewRound.liveGrid);
  const [state, setState] = useState<SessionState>("idle");
  const [targetGrid, setTargetGrid] = useState<boolean[][]>(() => previewRound.targetGrid);

  useEffect(() => {
    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setFlipCount(0);
    setLiveGrid(previewRound.liveGrid);
    setState("idle");
    setTargetGrid(previewRound.targetGrid);
  }, [previewRound]);

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

  function openRound(roundIndex: number) {
    const round = createRound(config, roundIndex);

    setCurrentRoundIndex(roundIndex);
    setLiveGrid(round.liveGrid);
    setTargetGrid(round.targetGrid);
  }

  function beginRun() {
    setElapsedSeconds(0);
    setFlipCount(0);
    setState("playing");
    openRound(0);
  }

  function flipTile(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const nextGrid = cloneBooleanGrid(liveGrid);
    toggleHorizontalStrip(nextGrid, rowIndex, columnIndex);
    const nextFlipCount = flipCount + 1;

    setLiveGrid(nextGrid);
    setFlipCount(nextFlipCount);

    if (!areBooleanGridsEqual(nextGrid, targetGrid)) {
      return "flipped" as const;
    }

    const nextRoundIndex = currentRoundIndex + 1;

    if (nextRoundIndex >= config.roundCount) {
      setState("cleared");
      return "flipped" as const;
    }

    openRound(nextRoundIndex);
    return "flipped" as const;
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    currentRoundIndex,
    elapsedSeconds,
    flipCount,
    liveGrid,
    roundCount: config.roundCount,
    rowCount: config.rowCount,
    state,
    targetGrid,
    timeLimitSeconds: config.timeLimitSeconds,
    flipTile,
  };
}
