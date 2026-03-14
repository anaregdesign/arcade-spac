import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type Cell = {
  id: string;
  isCleared: boolean;
  value: number;
};

const difficultyConfig: Record<Difficulty, { columns: number; maxNumber: number; rows: number; timeLimitSeconds: number }> = {
  EASY: { columns: 4, maxNumber: 16, rows: 4, timeLimitSeconds: 24 },
  NORMAL: { columns: 5, maxNumber: 25, rows: 5, timeLimitSeconds: 36 },
  HARD: { columns: 6, maxNumber: 30, rows: 5, timeLimitSeconds: 44 },
  EXPERT: { columns: 6, maxNumber: 36, rows: 6, timeLimitSeconds: 55 },
};

function chunkNumbers(values: number[], columns: number) {
  const rows: Cell[][] = [];

  for (let index = 0; index < values.length; index += columns) {
    rows.push(
      values.slice(index, index + columns).map((value) => ({
        id: `number-${value}`,
        isCleared: false,
        value,
      })),
    );
  }

  return rows;
}

function shuffle(values: number[]) {
  const next = values.slice();

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function createNumberSet(maxNumber: number) {
  return Array.from({ length: maxNumber }, (_, index) => index + 1);
}

export function useNumberChainSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [board, setBoard] = useState<Cell[][]>(() => chunkNumbers(createNumberSet(config.maxNumber), config.columns));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [nextNumber, setNextNumber] = useState(1);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongTapCount, setWrongTapCount] = useState(0);

  useEffect(() => {
    setBoard(chunkNumbers(createNumberSet(config.maxNumber), config.columns));
    setElapsedSeconds(0);
    setNextNumber(1);
    setState("idle");
    setWrongTapCount(0);
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((currentValue) => {
        const nextValue = Math.min(config.timeLimitSeconds, currentValue + 1);

        if (nextValue >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return nextValue;
      });
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    setBoard(chunkNumbers(shuffle(createNumberSet(config.maxNumber)), config.columns));
    setElapsedSeconds(0);
    setNextNumber(1);
    setState("playing");
    setWrongTapCount(0);
  }

  function tapCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return;
    }

    const currentCell = board[rowIndex]?.[columnIndex];

    if (!currentCell || currentCell.isCleared) {
      return;
    }

    if (currentCell.value !== nextNumber) {
      setWrongTapCount((currentValue) => currentValue + 1);
      return;
    }

    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    nextBoard[rowIndex][columnIndex].isCleared = true;
    const nextValue = nextNumber + 1;

    setBoard(nextBoard);

    if (nextNumber === config.maxNumber) {
      setState("cleared");
      return;
    }

    setNextNumber(nextValue);
  }

  return {
    beginRun,
    board,
    columns: config.columns,
    elapsedSeconds,
    nextNumber,
    remainingCount: config.maxNumber - nextNumber + 1,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    totalCount: config.maxNumber,
    wrongTapCount,
    tapCell,
  };
}
