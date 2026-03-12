import { useEffect, useMemo, useState } from "react";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";

type Cell = {
  adjacentMines: number;
  hasMine: boolean;
  isExploded: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
};

type SessionState = "idle" | "playing" | "cleared";

const difficultyConfig: Record<Difficulty, { columns: number; mines: number; rows: number }> = {
  EASY: { columns: 8, mines: 10, rows: 8 },
  NORMAL: { columns: 10, mines: 15, rows: 10 },
  HARD: { columns: 12, mines: 24, rows: 12 },
  EXPERT: { columns: 14, mines: 34, rows: 14 },
};

function createEmptyBoard(rows: number, columns: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      adjacentMines: 0,
      hasMine: false,
      isExploded: false,
      isFlagged: false,
      isRevealed: false,
    })),
  );
}

function cloneBoard(board: Cell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function neighbors(rowIndex: number, columnIndex: number, rows: number, columns: number) {
  const points: Array<{ columnIndex: number; rowIndex: number }> = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }

      const nextRowIndex = rowIndex + rowOffset;
      const nextColumnIndex = columnIndex + columnOffset;

      if (nextRowIndex < 0 || nextColumnIndex < 0 || nextRowIndex >= rows || nextColumnIndex >= columns) {
        continue;
      }

      points.push({ rowIndex: nextRowIndex, columnIndex: nextColumnIndex });
    }
  }

  return points;
}

function populateBoard(rows: number, columns: number, mines: number, safeRowIndex: number, safeColumnIndex: number) {
  const board = createEmptyBoard(rows, columns);
  const reserved = new Set<string>([`${safeRowIndex}:${safeColumnIndex}`]);

  while (reserved.size - 1 < mines) {
    const rowIndex = Math.floor(Math.random() * rows);
    const columnIndex = Math.floor(Math.random() * columns);
    const key = `${rowIndex}:${columnIndex}`;

    if (reserved.has(key)) {
      continue;
    }

    reserved.add(key);
    board[rowIndex][columnIndex].hasMine = true;
  }

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      if (board[rowIndex][columnIndex].hasMine) {
        continue;
      }

      board[rowIndex][columnIndex].adjacentMines = neighbors(rowIndex, columnIndex, rows, columns)
        .filter((point) => board[point.rowIndex][point.columnIndex].hasMine)
        .length;
    }
  }

  return board;
}

function revealFrom(board: Cell[][], startRowIndex: number, startColumnIndex: number) {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;
  const queue = [{ rowIndex: startRowIndex, columnIndex: startColumnIndex }];

  while (queue.length > 0) {
    const point = queue.shift()!;
    const cell = board[point.rowIndex][point.columnIndex];

    if (cell.isRevealed || cell.isFlagged || cell.hasMine) {
      continue;
    }

    cell.isRevealed = true;

    if (cell.adjacentMines > 0) {
      continue;
    }

    queue.push(...neighbors(point.rowIndex, point.columnIndex, rows, columns));
  }
}

function isBoardCleared(board: Cell[][]) {
  return board.every((row) => row.every((cell) => cell.hasMine || cell.isRevealed));
}

export function useMinesweeperSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard(config.rows, config.columns));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [state]);

  function resetBoard() {
    setBoard(createEmptyBoard(config.rows, config.columns));
    setElapsedSeconds(0);
    setMistakeCount(0);
    setStarted(false);
    setState("idle");
  }

  function beginRun() {
    resetBoard();
    setState("playing");
  }

  function ensureBoard(rowIndex: number, columnIndex: number) {
    if (started) {
      return cloneBoard(board);
    }

    const nextBoard = populateBoard(config.rows, config.columns, config.mines, rowIndex, columnIndex);
    setStarted(true);
    return nextBoard;
  }

  function revealCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return;
    }

    const nextBoard = ensureBoard(rowIndex, columnIndex);
    const cell = nextBoard[rowIndex][columnIndex];

    if (cell.isFlagged || cell.isRevealed) {
      setBoard(nextBoard);
      return;
    }

    if (cell.hasMine) {
      cell.isExploded = true;
      cell.isRevealed = true;
      setMistakeCount((value) => value + 1);
      setBoard(nextBoard);
      return;
    }

    revealFrom(nextBoard, rowIndex, columnIndex);

    if (isBoardCleared(nextBoard)) {
      setState("cleared");
    }

    setBoard(nextBoard);
  }

  function toggleFlag(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return;
    }

    const nextBoard = cloneBoard(board);
    const cell = nextBoard[rowIndex][columnIndex];

    if (cell.isRevealed) {
      setBoard(nextBoard);
      return;
    }

    cell.isFlagged = !cell.isFlagged;
    setBoard(nextBoard);
  }

  const flaggedCount = board.flat().filter((cell) => cell.isFlagged).length;

  return {
    beginRun,
    board,
    elapsedSeconds,
    flaggedCount,
    mistakeCount,
    resetBoard,
    revealCell,
    state,
    toggleFlag,
    totalMines: config.mines,
  };
}