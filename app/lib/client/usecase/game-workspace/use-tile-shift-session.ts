import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomInt, rotateValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  scrambleMoves: number;
  timeLimitSeconds: number;
};

const tileSymbols = ["▲", "■", "●", "◆", "✦", "⬟", "✚", "★", "✿", "⬢"] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, rowCount: 3, scrambleMoves: 4, timeLimitSeconds: 44 },
  NORMAL: { columnCount: 3, rowCount: 4, scrambleMoves: 5, timeLimitSeconds: 58 },
  HARD: { columnCount: 4, rowCount: 4, scrambleMoves: 6, timeLimitSeconds: 74 },
  EXPERT: { columnCount: 4, rowCount: 5, scrambleMoves: 7, timeLimitSeconds: 92 },
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

function shiftRowRight(board: string[][], rowIndex: number) {
  board[rowIndex] = rotateValues(board[rowIndex], 1);
}

function shiftColumnDown(board: string[][], columnIndex: number) {
  const column = board.map((row) => row[columnIndex]);
  const rotated = rotateValues(column, 1);

  rotated.forEach((value, rowIndex) => {
    board[rowIndex][columnIndex] = value;
  });
}

function buildScrambledBoard(targetBoard: string[][], config: DifficultyConfig) {
  const next = cloneBoard(targetBoard);

  for (let index = 0; index < config.scrambleMoves; index += 1) {
    if (Math.random() > 0.5) {
      shiftRowRight(next, randomInt(config.rowCount));
    } else {
      shiftColumnDown(next, randomInt(config.columnCount));
    }
  }

  if (boardsEqual(next, targetBoard)) {
    shiftRowRight(next, 0);
  }

  return next;
}

function buildPreviewBoard(targetBoard: string[][], config: DifficultyConfig) {
  const next = cloneBoard(targetBoard);

  shiftRowRight(next, 0);

  if (config.rowCount > 1) {
    shiftColumnDown(next, config.columnCount - 1);
  }

  return next;
}

export function useTileShiftSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveBoard, setLiveBoard] = useState<string[][]>(() => buildPreviewBoard(buildTargetBoard(config), config));
  const [moveCount, setMoveCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [targetBoard, setTargetBoard] = useState<string[][]>(() => buildTargetBoard(config));

  useEffect(() => {
    const nextTargetBoard = buildTargetBoard(config);

    setElapsedSeconds(0);
    setLiveBoard(buildPreviewBoard(nextTargetBoard, config));
    setMoveCount(0);
    setState("idle");
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
    setMoveCount(0);
    setState("playing");
    setTargetBoard(nextTargetBoard);
  }

  function shiftRow(rowIndex: number) {
    if (state !== "playing") {
      return;
    }

    const nextBoard = cloneBoard(liveBoard);
    shiftRowRight(nextBoard, rowIndex);
    const nextMoveCount = moveCount + 1;

    setLiveBoard(nextBoard);
    setMoveCount(nextMoveCount);

    if (boardsEqual(nextBoard, targetBoard)) {
      setState("cleared");
    }
  }

  function shiftColumn(columnIndex: number) {
    if (state !== "playing") {
      return;
    }

    const nextBoard = cloneBoard(liveBoard);
    shiftColumnDown(nextBoard, columnIndex);
    const nextMoveCount = moveCount + 1;

    setLiveBoard(nextBoard);
    setMoveCount(nextMoveCount);

    if (boardsEqual(nextBoard, targetBoard)) {
      setState("cleared");
    }
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    liveBoard,
    moveCount,
    rowCount: config.rowCount,
    shiftColumn,
    shiftRow,
    state,
    targetBoard,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
