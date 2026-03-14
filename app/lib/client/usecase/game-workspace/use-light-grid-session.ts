import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import {
  areBooleanGridsEqual,
  cloneBooleanGrid,
  createBooleanGrid,
  randomInt,
  toggleCellWithOrthogonalNeighbors,
} from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  scrambleCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, rowCount: 3, scrambleCount: 4, timeLimitSeconds: 42 },
  NORMAL: { columnCount: 4, rowCount: 3, scrambleCount: 5, timeLimitSeconds: 56 },
  HARD: { columnCount: 4, rowCount: 4, scrambleCount: 6, timeLimitSeconds: 70 },
  EXPERT: { columnCount: 5, rowCount: 4, scrambleCount: 7, timeLimitSeconds: 86 },
};

function buildTargetGrid(config: DifficultyConfig) {
  const next = createBooleanGrid(config.rowCount, config.columnCount);

  for (let index = 0; index < config.scrambleCount; index += 1) {
    toggleCellWithOrthogonalNeighbors(next, randomInt(config.rowCount), randomInt(config.columnCount));
  }

  if (next.every((row) => row.every((cell) => !cell))) {
    toggleCellWithOrthogonalNeighbors(next, Math.floor(config.rowCount / 2), Math.floor(config.columnCount / 2));
  }

  return next;
}

function buildPreviewTargetGrid(config: DifficultyConfig) {
  const next = createBooleanGrid(config.rowCount, config.columnCount);
  const anchorPoints = [
    [0, 0],
    [config.rowCount - 1, config.columnCount - 1],
    [Math.floor(config.rowCount / 2), Math.floor(config.columnCount / 2)],
  ] as const;

  for (const [rowIndex, columnIndex] of anchorPoints) {
    toggleCellWithOrthogonalNeighbors(next, rowIndex, columnIndex);
  }

  return next;
}

export function useLightGridSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveGrid, setLiveGrid] = useState<boolean[][]>(() => createBooleanGrid(config.rowCount, config.columnCount));
  const [moveCount, setMoveCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [targetGrid, setTargetGrid] = useState<boolean[][]>(() => buildPreviewTargetGrid(config));

  useEffect(() => {
    setElapsedSeconds(0);
    setLiveGrid(createBooleanGrid(config.rowCount, config.columnCount));
    setMoveCount(0);
    setState("idle");
    setTargetGrid(buildPreviewTargetGrid(config));
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
    setLiveGrid(createBooleanGrid(config.rowCount, config.columnCount));
    setMoveCount(0);
    setState("playing");
    setTargetGrid(buildTargetGrid(config));
  }

  function toggleCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored";
    }

    const nextGrid = cloneBooleanGrid(liveGrid);
    toggleCellWithOrthogonalNeighbors(nextGrid, rowIndex, columnIndex);
    const nextMoveCount = moveCount + 1;

    setLiveGrid(nextGrid);
    setMoveCount(nextMoveCount);

    if (areBooleanGridsEqual(nextGrid, targetGrid)) {
      setState("cleared");
    }

    return "toggled";
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    liveGrid,
    moveCount,
    rowCount: config.rowCount,
    state,
    targetGrid,
    timeLimitSeconds: config.timeLimitSeconds,
    toggleCell,
  };
}
