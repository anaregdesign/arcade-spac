import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type SwapCell = {
  columnIndex: number;
  rowIndex: number;
};

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  scrambleSwapCount: number;
  swapBudget: number;
  timeLimitSeconds: number;
};

const tileSymbols = ["▲", "■", "●", "◆", "✦", "⬟", "✚", "★", "✿", "⬢", "⬣", "⬡"] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, rowCount: 3, scrambleSwapCount: 4, swapBudget: 5, timeLimitSeconds: 34 },
  NORMAL: { columnCount: 3, rowCount: 4, scrambleSwapCount: 6, swapBudget: 7, timeLimitSeconds: 48 },
  HARD: { columnCount: 4, rowCount: 4, scrambleSwapCount: 8, swapBudget: 9, timeLimitSeconds: 62 },
  EXPERT: { columnCount: 4, rowCount: 5, scrambleSwapCount: 10, swapBudget: 12, timeLimitSeconds: 80 },
};

function cloneBoard(board: string[][]) {
  return board.map((row) => [...row]);
}

function boardsEqual(left: string[][], right: string[][]) {
  return left.every((row, rowIndex) => row.every((value, columnIndex) => value === right[rowIndex]?.[columnIndex]));
}

function buildTargetBoard(config: DifficultyConfig) {
  return Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => tileSymbols[(rowIndex * config.columnCount + columnIndex) % tileSymbols.length]),
  );
}

function createCellPool(config: DifficultyConfig) {
  return Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => ({ rowIndex, columnIndex })),
  ).flat();
}

function swapCells(board: string[][], left: SwapCell, right: SwapCell) {
  const next = cloneBoard(board);
  const leftValue = next[left.rowIndex]?.[left.columnIndex];
  const rightValue = next[right.rowIndex]?.[right.columnIndex];

  if (leftValue === undefined || rightValue === undefined) {
    return next;
  }

  next[left.rowIndex][left.columnIndex] = rightValue;
  next[right.rowIndex][right.columnIndex] = leftValue;
  return next;
}

function pickDistinctCells(config: DifficultyConfig) {
  const cells = createCellPool(config);
  const left = cells[randomInt(cells.length)];
  let right = cells[randomInt(cells.length)];

  while (right.rowIndex === left.rowIndex && right.columnIndex === left.columnIndex) {
    right = cells[randomInt(cells.length)];
  }

  return { left, right };
}

function buildScrambledBoard(targetBoard: string[][], config: DifficultyConfig) {
  let next = cloneBoard(targetBoard);

  for (let index = 0; index < config.scrambleSwapCount; index += 1) {
    const pair = pickDistinctCells(config);
    next = swapCells(next, pair.left, pair.right);
  }

  if (boardsEqual(next, targetBoard)) {
    const pair = pickDistinctCells(config);
    next = swapCells(next, pair.left, pair.right);
  }

  return next;
}

function buildPreviewBoard(targetBoard: string[][], config: DifficultyConfig) {
  const pair = {
    left: { rowIndex: 0, columnIndex: 0 },
    right: { rowIndex: Math.min(config.rowCount - 1, 1), columnIndex: Math.min(config.columnCount - 1, 1) },
  };

  return swapCells(targetBoard, pair.left, pair.right);
}

function countMismatches(board: string[][], targetBoard: string[][]) {
  return board.reduce(
    (total, row, rowIndex) => total + row.filter((value, columnIndex) => value !== targetBoard[rowIndex]?.[columnIndex]).length,
    0,
  );
}

function sameCell(left: SwapCell | null, right: SwapCell) {
  return left?.rowIndex === right.rowIndex && left?.columnIndex === right.columnIndex;
}

export function useSwapSolveSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveBoard, setLiveBoard] = useState<string[][]>(() => buildPreviewBoard(buildTargetBoard(config), config));
  const [selectedCell, setSelectedCell] = useState<SwapCell | null>(null);
  const [state, setState] = useState<SessionState>("idle");
  const [swapCount, setSwapCount] = useState(0);
  const [targetBoard, setTargetBoard] = useState<string[][]>(() => buildTargetBoard(config));

  useEffect(() => {
    const nextTargetBoard = buildTargetBoard(config);

    setElapsedSeconds(0);
    setLiveBoard(buildPreviewBoard(nextTargetBoard, config));
    setSelectedCell(null);
    setState("idle");
    setSwapCount(0);
    setTargetBoard(nextTargetBoard);
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
    const nextTargetBoard = buildTargetBoard(config);

    setElapsedSeconds(0);
    setLiveBoard(buildScrambledBoard(nextTargetBoard, config));
    setSelectedCell(null);
    setState("playing");
    setSwapCount(0);
    setTargetBoard(nextTargetBoard);
  }

  function pressCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const nextCell = { rowIndex, columnIndex };

    if (sameCell(selectedCell, nextCell)) {
      setSelectedCell(null);
      return "deselected" as const;
    }

    if (!selectedCell) {
      setSelectedCell(nextCell);
      return "selected" as const;
    }

    const nextBoard = swapCells(liveBoard, selectedCell, nextCell);
    const nextSwapCount = swapCount + 1;

    setLiveBoard(nextBoard);
    setSelectedCell(null);
    setSwapCount(nextSwapCount);

    if (boardsEqual(nextBoard, targetBoard)) {
      setState("cleared");
      return "solved" as const;
    }

    if (nextSwapCount >= config.swapBudget) {
      setState("failed");
    }

    return "swapped" as const;
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    liveBoard,
    mismatchCount: countMismatches(liveBoard, targetBoard),
    rowCount: config.rowCount,
    selectedCell,
    state,
    swapBudget: config.swapBudget,
    swapCount,
    targetBoard,
    timeLimitSeconds: config.timeLimitSeconds,
    pressCell,
  };
}
