import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type Direction = "up" | "right" | "down" | "left";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type SpawnEntry = {
  column: number;
  row: number;
  value: number;
};

type DifficultyConfig = {
  boardSize: number;
  previewBoard: number[][];
  spawnQueue: SpawnEntry[];
  targetValue: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    boardSize: 3,
    previewBoard: [
      [4, 4, 0],
      [4, 4, 0],
      [0, 0, 0],
    ],
    spawnQueue: [
      { column: 2, row: 2, value: 2 },
      { column: 2, row: 1, value: 2 },
      { column: 1, row: 2, value: 4 },
    ],
    targetValue: 16,
    timeLimitSeconds: 48,
  },
  NORMAL: {
    boardSize: 4,
    previewBoard: [
      [8, 8, 0, 0],
      [8, 8, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    spawnQueue: [
      { column: 3, row: 3, value: 2 },
      { column: 2, row: 0, value: 2 },
      { column: 0, row: 3, value: 4 },
      { column: 3, row: 1, value: 2 },
    ],
    targetValue: 32,
    timeLimitSeconds: 62,
  },
  HARD: {
    boardSize: 4,
    previewBoard: [
      [16, 16, 0, 0],
      [16, 16, 0, 0],
      [2, 0, 0, 2],
      [0, 0, 0, 0],
    ],
    spawnQueue: [
      { column: 3, row: 3, value: 2 },
      { column: 2, row: 2, value: 4 },
      { column: 0, row: 3, value: 4 },
      { column: 3, row: 1, value: 2 },
      { column: 1, row: 3, value: 8 },
    ],
    targetValue: 64,
    timeLimitSeconds: 78,
  },
  EXPERT: {
    boardSize: 4,
    previewBoard: [
      [32, 32, 0, 0],
      [32, 32, 0, 0],
      [4, 0, 0, 4],
      [0, 0, 0, 0],
    ],
    spawnQueue: [
      { column: 3, row: 3, value: 2 },
      { column: 2, row: 2, value: 4 },
      { column: 0, row: 3, value: 8 },
      { column: 3, row: 1, value: 4 },
      { column: 1, row: 3, value: 8 },
      { column: 2, row: 0, value: 16 },
    ],
    targetValue: 128,
    timeLimitSeconds: 94,
  },
};

function cloneBoard(board: number[][]) {
  return board.map((row) => [...row]);
}

function boardsEqual(left: number[][], right: number[][]) {
  return left.every((row, rowIndex) => row.every((value, columnIndex) => value === right[rowIndex]?.[columnIndex]));
}

function countEmptyCells(board: number[][]) {
  return board.reduce((total, row) => total + row.filter((cell) => cell === 0).length, 0);
}

function getMaxValue(board: number[][]) {
  return board.reduce((maxValue, row) => Math.max(maxValue, ...row), 0);
}

function slideLine(line: number[]) {
  const compact = line.filter((value) => value > 0);
  const merged: number[] = [];

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index];
    const next = compact[index + 1];

    if (next !== undefined && current === next) {
      merged.push(current * 2);
      index += 1;
      continue;
    }

    merged.push(current);
  }

  while (merged.length < line.length) {
    merged.push(0);
  }

  return merged;
}

function readLine(board: number[][], boardSize: number, direction: Direction, index: number) {
  if (direction === "left" || direction === "right") {
    const row = board[index] ?? [];
    return direction === "left" ? [...row] : [...row].reverse();
  }

  const column = Array.from({ length: boardSize }, (_, rowIndex) => board[rowIndex]?.[index] ?? 0);
  return direction === "up" ? column : column.reverse();
}

function writeLine(board: number[][], boardSize: number, direction: Direction, index: number, line: number[]) {
  if (direction === "left" || direction === "right") {
    const values = direction === "left" ? line : [...line].reverse();
    board[index] = values;
    return;
  }

  const values = direction === "up" ? line : [...line].reverse();

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    board[rowIndex][index] = values[rowIndex] ?? 0;
  }
}

function applyMove(board: number[][], boardSize: number, direction: Direction) {
  const nextBoard = cloneBoard(board);

  for (let index = 0; index < boardSize; index += 1) {
    const line = readLine(nextBoard, boardSize, direction, index);
    const slidLine = slideLine(line);
    writeLine(nextBoard, boardSize, direction, index, slidLine);
  }

  return {
    board: nextBoard,
    changed: !boardsEqual(board, nextBoard),
  };
}

function canMove(board: number[][]) {
  for (let rowIndex = 0; rowIndex < board.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex += 1) {
      const value = board[rowIndex][columnIndex];

      if (value === 0) {
        return true;
      }

      if (board[rowIndex][columnIndex + 1] === value || board[rowIndex + 1]?.[columnIndex] === value) {
        return true;
      }
    }
  }

  return false;
}

function placeSpawn(board: number[][], boardSize: number, spawnEntry: SpawnEntry | null) {
  const nextBoard = cloneBoard(board);

  if (spawnEntry && nextBoard[spawnEntry.row]?.[spawnEntry.column] === 0) {
    nextBoard[spawnEntry.row][spawnEntry.column] = spawnEntry.value;
    return nextBoard;
  }

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
      if (nextBoard[rowIndex][columnIndex] === 0) {
        nextBoard[rowIndex][columnIndex] = spawnEntry?.value ?? 2;
        return nextBoard;
      }
    }
  }

  return nextBoard;
}

export function useMergeClimbSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [board, setBoard] = useState<number[][]>(() => cloneBoard(config.previewBoard));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastMoveDirection, setLastMoveDirection] = useState<Direction | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [spawnIndex, setSpawnIndex] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setBoard(cloneBoard(config.previewBoard));
    setElapsedSeconds(0);
    setLastMoveDirection(null);
    setMoveCount(0);
    setSpawnIndex(0);
    setState("idle");
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
    setBoard(cloneBoard(config.previewBoard));
    setElapsedSeconds(0);
    setLastMoveDirection(null);
    setMoveCount(0);
    setSpawnIndex(0);
    setState("playing");
  }

  function move(direction: Direction) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const nextMove = applyMove(board, config.boardSize, direction);

    if (!nextMove.changed) {
      return "blocked" as const;
    }

    const nextMoveCount = moveCount + 1;
    let resolvedBoard = nextMove.board;
    let nextState: SessionState = "playing";

    if (getMaxValue(resolvedBoard) >= config.targetValue) {
      nextState = "cleared";
    } else {
      resolvedBoard = placeSpawn(resolvedBoard, config.boardSize, config.spawnQueue[spawnIndex] ?? null);

      if (getMaxValue(resolvedBoard) >= config.targetValue) {
        nextState = "cleared";
      } else if (!canMove(resolvedBoard)) {
        nextState = "failed";
      }
    }

    setBoard(resolvedBoard);
    setLastMoveDirection(direction);
    setMoveCount(nextMoveCount);
    setSpawnIndex((current) => current + 1);
    setState(nextState);

    return nextState === "cleared"
      ? ("cleared" as const)
      : nextState === "failed"
        ? ("failed" as const)
        : ("moved" as const);
  }

  return {
    beginRun,
    board,
    boardSize: config.boardSize,
    elapsedSeconds,
    emptyCellCount: countEmptyCells(board),
    lastMoveDirection,
    maxValue: getMaxValue(board),
    move,
    moveCount,
    nextSpawnValue: config.spawnQueue[spawnIndex]?.value ?? 2,
    state,
    targetValue: config.targetValue,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
