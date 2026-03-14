import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import { randomInt, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "inputting" | "cleared" | "failed";

type SwapCell = {
  columnIndex: number;
  rowIndex: number;
};

type DifficultyConfig = {
  columnCount: number;
  initialScrambleSwapCount: number;
  maxScrambleSwapCount: number;
  roundCount: number;
  rowCount: number;
  timeLimitSeconds: number;
  watchDurationMs: number;
};

const tileSymbols = ["▲", "■", "●", "◆", "✦", "⬟", "✚", "★", "✿", "⬢", "⬣", "⬡"] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, initialScrambleSwapCount: 2, maxScrambleSwapCount: 4, roundCount: 3, rowCount: 3, timeLimitSeconds: 40, watchDurationMs: 1400 },
  NORMAL: { columnCount: 3, initialScrambleSwapCount: 3, maxScrambleSwapCount: 5, roundCount: 4, rowCount: 3, timeLimitSeconds: 52, watchDurationMs: 1240 },
  HARD: { columnCount: 4, initialScrambleSwapCount: 4, maxScrambleSwapCount: 7, roundCount: 5, rowCount: 4, timeLimitSeconds: 66, watchDurationMs: 1080 },
  EXPERT: { columnCount: 4, initialScrambleSwapCount: 5, maxScrambleSwapCount: 9, roundCount: 6, rowCount: 4, timeLimitSeconds: 80, watchDurationMs: 920 },
};
const previewDifficultyOffset: Record<Difficulty, number> = {
  EASY: 0,
  NORMAL: 2,
  HARD: 4,
  EXPERT: 6,
};

function cloneBoard(board: string[][]) {
  return board.map((row) => [...row]);
}

function boardsEqual(left: string[][], right: string[][]) {
  return left.every((row, rowIndex) => row.every((value, columnIndex) => value === right[rowIndex]?.[columnIndex]));
}

function createCellPool(config: Pick<DifficultyConfig, "columnCount" | "rowCount">) {
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

function pickDistinctCells(config: Pick<DifficultyConfig, "columnCount" | "rowCount">) {
  const cells = createCellPool(config);
  const left = cells[randomInt(cells.length)];
  let right = cells[randomInt(cells.length)];

  while (right.rowIndex === left.rowIndex && right.columnIndex === left.columnIndex) {
    right = cells[randomInt(cells.length)];
  }

  return { left, right };
}

function buildTargetBoard(config: Pick<DifficultyConfig, "columnCount" | "rowCount">, roundIndex: number) {
  const symbolPool = shuffleValues(tileSymbols);
  const totalCellCount = config.rowCount * config.columnCount;
  const rotatedSymbols = Array.from({ length: totalCellCount }, (_, index) => symbolPool[(index + roundIndex) % symbolPool.length]);

  return Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => rotatedSymbols[rowIndex * config.columnCount + columnIndex] ?? "•"),
  );
}

function scrambleSwapCountForRound(config: DifficultyConfig, roundIndex: number) {
  return Math.min(config.maxScrambleSwapCount, config.initialScrambleSwapCount + roundIndex);
}

function buildScrambledBoard(targetBoard: string[][], config: DifficultyConfig, roundIndex: number) {
  let next = cloneBoard(targetBoard);
  const scrambleSwapCount = scrambleSwapCountForRound(config, roundIndex);

  for (let index = 0; index < scrambleSwapCount; index += 1) {
    const pair = pickDistinctCells(config);
    next = swapCells(next, pair.left, pair.right);
  }

  if (boardsEqual(next, targetBoard)) {
    const pair = pickDistinctCells(config);
    next = swapCells(next, pair.left, pair.right);
  }

  return next;
}

function buildPreviewBoards(config: DifficultyConfig, difficulty: Difficulty) {
  const totalCellCount = config.rowCount * config.columnCount;
  const offset = previewDifficultyOffset[difficulty];
  const previewSymbols = Array.from(
    { length: totalCellCount },
    (_, index) => tileSymbols[(index + offset) % tileSymbols.length] ?? "•",
  );
  const targetBoard = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => previewSymbols[rowIndex * config.columnCount + columnIndex] ?? "•"),
  );
  let liveBoard = cloneBoard(targetBoard);
  const previewSwapCount = Math.max(2, Math.min(4, config.initialScrambleSwapCount));

  for (let index = 0; index < previewSwapCount; index += 1) {
    const leftIndex = (index * 2) % totalCellCount;
    const rightIndex = (totalCellCount - 1 - index + totalCellCount) % totalCellCount;
    const left = {
      columnIndex: leftIndex % config.columnCount,
      rowIndex: Math.floor(leftIndex / config.columnCount),
    };
    const right = {
      columnIndex: rightIndex % config.columnCount,
      rowIndex: Math.floor(rightIndex / config.columnCount),
    };

    if (left.rowIndex === right.rowIndex && left.columnIndex === right.columnIndex) {
      continue;
    }

    liveBoard = swapCells(liveBoard, left, right);
  }

  return { liveBoard, targetBoard };
}

function sameCell(left: SwapCell | null, right: SwapCell) {
  return left?.rowIndex === right.rowIndex && left?.columnIndex === right.columnIndex;
}

export function useTileInstantSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewBoards = useMemo(() => buildPreviewBoards(config, difficulty), [config, difficulty]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveBoard, setLiveBoard] = useState<string[][]>(previewBoards.liveBoard);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<SwapCell | null>(null);
  const [state, setState] = useState<SessionState>("idle");
  const [targetBoard, setTargetBoard] = useState<string[][]>(previewBoards.targetBoard);

  const phaseTimeoutRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  function clearPhaseTimeout() {
    if (phaseTimeoutRef.current !== null) {
      clearBrowserTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }

  function resetSession() {
    clearPhaseTimeout();

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setLiveBoard(previewBoards.liveBoard);
    setMoveCount(0);
    setSelectedCell(null);
    setState("idle");
    setTargetBoard(previewBoards.targetBoard);
  }

  useEffect(() => {
    return () => {
      clearPhaseTimeout();

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config, previewBoards.liveBoard, previewBoards.targetBoard]);

  useEffect(() => {
    if (state !== "watching" && state !== "inputting") {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "watching" || currentState === "inputting" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [config.timeLimitSeconds, state]);

  function openRound(roundIndex: number) {
    const nextTargetBoard = buildTargetBoard(config, roundIndex);
    const nextLiveBoard = buildScrambledBoard(nextTargetBoard, config, roundIndex);

    clearPhaseTimeout();
    setCurrentRoundIndex(roundIndex);
    setLiveBoard(nextLiveBoard);
    setSelectedCell(null);
    setState("watching");
    setTargetBoard(nextTargetBoard);

    phaseTimeoutRef.current = startBrowserTimeout(() => {
      setState((current) => (current === "watching" ? "inputting" : current));
    }, config.watchDurationMs);
  }

  function beginRun() {
    setElapsedSeconds(0);
    setMoveCount(0);
    openRound(0);
  }

  function pressCell(rowIndex: number, columnIndex: number) {
    if (state !== "inputting") {
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

    const nextLiveBoard = swapCells(liveBoard, selectedCell, nextCell);
    const nextMoveCount = moveCount + 1;

    setLiveBoard(nextLiveBoard);
    setMoveCount(nextMoveCount);
    setSelectedCell(null);

    if (boardsEqual(nextLiveBoard, targetBoard)) {
      if (currentRoundIndex + 1 >= config.roundCount) {
        setState("cleared");
        return "solved" as const;
      }

      openRound(currentRoundIndex + 1);
      return "solved" as const;
    }

    return "swapped" as const;
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    currentRoundIndex,
    elapsedSeconds,
    liveBoard,
    moveCount,
    roundCount: config.roundCount,
    rowCount: config.rowCount,
    selectedCell,
    state,
    targetBoard,
    timeLimitSeconds: config.timeLimitSeconds,
    watchDurationMs: config.watchDurationMs,
    pressCell,
  };
}
