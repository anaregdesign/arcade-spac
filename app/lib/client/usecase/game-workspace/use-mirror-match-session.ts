import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { areBooleanGridsEqual, cloneBooleanGrid, createBooleanGrid, pickDistinctIndices } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  scrambleLitCount: number;
  targetLitCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, rowCount: 3, scrambleLitCount: 2, targetLitCount: 3, timeLimitSeconds: 34 },
  NORMAL: { columnCount: 4, rowCount: 3, scrambleLitCount: 3, targetLitCount: 4, timeLimitSeconds: 46 },
  HARD: { columnCount: 4, rowCount: 4, scrambleLitCount: 4, targetLitCount: 5, timeLimitSeconds: 58 },
  EXPERT: { columnCount: 5, rowCount: 4, scrambleLitCount: 5, targetLitCount: 6, timeLimitSeconds: 72 },
};

function buildRandomGrid(rowCount: number, columnCount: number, litCount: number) {
  const next = createBooleanGrid(rowCount, columnCount);

  for (const index of pickDistinctIndices(rowCount * columnCount, litCount)) {
    const rowIndex = Math.floor(index / columnCount);
    const columnIndex = index % columnCount;
    next[rowIndex][columnIndex] = true;
  }

  return next;
}

function mirrorGridHorizontally(grid: boolean[][]) {
  return grid.map((row) => [...row].reverse());
}

function buildPreviewTargetGrid(rowCount: number, columnCount: number) {
  const next = createBooleanGrid(rowCount, columnCount);

  next[0][0] = true;
  next[Math.max(0, rowCount - 1)][Math.max(0, columnCount - 1)] = true;
  next[Math.floor(rowCount / 2)][Math.floor(columnCount / 2)] = true;

  return next;
}

function buildPreviewLiveGrid(rowCount: number, columnCount: number) {
  const next = createBooleanGrid(rowCount, columnCount);

  next[0][Math.max(0, columnCount - 1)] = true;
  next[Math.max(0, rowCount - 1)][0] = true;

  return next;
}

export function useMirrorMatchSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveGrid, setLiveGrid] = useState<boolean[][]>(() => buildPreviewLiveGrid(config.rowCount, config.columnCount));
  const [moveCount, setMoveCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [targetGrid, setTargetGrid] = useState<boolean[][]>(() => buildPreviewTargetGrid(config.rowCount, config.columnCount));

  useEffect(() => {
    setElapsedSeconds(0);
    setLiveGrid(buildPreviewLiveGrid(config.rowCount, config.columnCount));
    setMoveCount(0);
    setState("idle");
    setTargetGrid(buildPreviewTargetGrid(config.rowCount, config.columnCount));
  }, [config]);

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
    setElapsedSeconds(0);
    setLiveGrid(buildRandomGrid(config.rowCount, config.columnCount, config.scrambleLitCount));
    setMoveCount(0);
    setState("playing");
    setTargetGrid(buildRandomGrid(config.rowCount, config.columnCount, config.targetLitCount));
  }

  function toggleCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored";
    }

    const nextGrid = cloneBooleanGrid(liveGrid);
    nextGrid[rowIndex][columnIndex] = !nextGrid[rowIndex][columnIndex];
    const nextMoveCount = moveCount + 1;

    setLiveGrid(nextGrid);
    setMoveCount(nextMoveCount);

    if (areBooleanGridsEqual(nextGrid, mirrorGridHorizontally(targetGrid))) {
      setState("cleared");
    }

    return "toggled";
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    liveGrid,
    mirroredTargetGrid: mirrorGridHorizontally(targetGrid),
    moveCount,
    rowCount: config.rowCount,
    state,
    targetGrid,
    timeLimitSeconds: config.timeLimitSeconds,
    toggleCell,
  };
}
