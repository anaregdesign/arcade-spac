import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomIntInRange, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type SumGridPuzzle = {
  availableNumbers: number[];
  columnCount: number;
  currentGrid: Array<Array<number | null>>;
  originalNumbers: number[];
  rowCount: number;
  rowSums: number[];
  solvedBoard: number[][];
  columnSums: number[];
};

type DifficultyConfig = {
  columnCount: number;
  puzzleCount: number;
  rowCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 2, puzzleCount: 3, rowCount: 2, timeLimitSeconds: 36 },
  NORMAL: { columnCount: 2, puzzleCount: 4, rowCount: 3, timeLimitSeconds: 48 },
  HARD: { columnCount: 3, puzzleCount: 4, rowCount: 2, timeLimitSeconds: 58 },
  EXPERT: { columnCount: 3, puzzleCount: 5, rowCount: 3, timeLimitSeconds: 74 },
};

function createEmptyGrid(rowCount: number, columnCount: number) {
  return Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, () => null as number | null));
}

function buildSolvedBoard(config: DifficultyConfig) {
  const used = new Set<number>();
  const values: number[] = [];

  while (values.length < config.rowCount * config.columnCount) {
    const candidate = randomIntInRange(1, 12);

    if (used.has(candidate)) {
      continue;
    }

    used.add(candidate);
    values.push(candidate);
  }

  return Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => values[rowIndex * config.columnCount + columnIndex]),
  );
}

function buildPuzzle(config: DifficultyConfig): SumGridPuzzle {
  const solvedBoard = buildSolvedBoard(config);
  const originalNumbers = shuffleValues(solvedBoard.flat());

  return {
    availableNumbers: [...originalNumbers],
    columnCount: config.columnCount,
    currentGrid: createEmptyGrid(config.rowCount, config.columnCount),
    originalNumbers,
    rowCount: config.rowCount,
    rowSums: solvedBoard.map((row) => row.reduce((sum, value) => sum + value, 0)),
    solvedBoard,
    columnSums: Array.from({ length: config.columnCount }, (_, columnIndex) =>
      solvedBoard.reduce((sum, row) => sum + row[columnIndex], 0),
    ),
  };
}

function createPreviewPuzzle(config: DifficultyConfig): SumGridPuzzle {
  const solvedBoard = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => rowIndex * config.columnCount + columnIndex + 1),
  );
  const originalNumbers = [...solvedBoard.flat()].reverse();

  return {
    availableNumbers: [...originalNumbers],
    columnCount: config.columnCount,
    currentGrid: createEmptyGrid(config.rowCount, config.columnCount),
    originalNumbers,
    rowCount: config.rowCount,
    rowSums: solvedBoard.map((row) => row.reduce((sum, value) => sum + value, 0)),
    solvedBoard,
    columnSums: Array.from({ length: config.columnCount }, (_, columnIndex) =>
      solvedBoard.reduce((sum, row) => sum + row[columnIndex], 0),
    ),
  };
}

function isGridComplete(grid: Array<Array<number | null>>) {
  return grid.every((row) => row.every((value) => value !== null));
}

function isGridSolved(puzzle: SumGridPuzzle) {
  return puzzle.currentGrid.every((row, rowIndex) => row.every((value, columnIndex) => value === puzzle.solvedBoard[rowIndex][columnIndex]));
}

export function useSumGridSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewPuzzle = useMemo(() => createPreviewPuzzle(config), [config]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [puzzle, setPuzzle] = useState<SumGridPuzzle>(previewPuzzle);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongGridCount, setWrongGridCount] = useState(0);

  useEffect(() => {
    setElapsedSeconds(0);
    setPuzzle(previewPuzzle);
    setPuzzleIndex(0);
    setSelectedNumber(null);
    setState("idle");
    setWrongGridCount(0);
  }, [config, previewPuzzle]);

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
    setPuzzle(buildPuzzle(config));
    setPuzzleIndex(0);
    setSelectedNumber(null);
    setState("playing");
    setWrongGridCount(0);
  }

  function selectNumber(value: number) {
    if (state !== "playing") {
      return;
    }

    setSelectedNumber((current) => (current === value ? null : value));
  }

  function pressCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const currentValue = puzzle.currentGrid[rowIndex]?.[columnIndex];

    if (currentValue !== null) {
      setPuzzle((current) => ({
        ...current,
        availableNumbers: [...current.availableNumbers, currentValue].sort((left, right) => left - right),
        currentGrid: current.currentGrid.map((row, nextRowIndex) =>
          row.map((value, nextColumnIndex) => (nextRowIndex === rowIndex && nextColumnIndex === columnIndex ? null : value)),
        ),
      }));
      if (selectedNumber === currentValue) {
        setSelectedNumber(null);
      }
      return "removed" as const;
    }

    if (selectedNumber === null) {
      return "ignored" as const;
    }

    setPuzzle((current) => {
      const numberIndex = current.availableNumbers.indexOf(selectedNumber);

      if (numberIndex === -1) {
        return current;
      }

      const nextAvailable = [...current.availableNumbers];
      nextAvailable.splice(numberIndex, 1);
      const nextGrid = current.currentGrid.map((row, nextRowIndex) =>
        row.map((value, nextColumnIndex) => (nextRowIndex === rowIndex && nextColumnIndex === columnIndex ? selectedNumber : value)),
      );

      return {
        ...current,
        availableNumbers: nextAvailable,
        currentGrid: nextGrid,
      };
    });
    setSelectedNumber(null);
    return "placed" as const;
  }

  useEffect(() => {
    if (state !== "playing") {
      return;
    }

    if (!isGridComplete(puzzle.currentGrid)) {
      return;
    }

    if (isGridSolved(puzzle)) {
      const nextPuzzleIndex = puzzleIndex + 1;

      if (nextPuzzleIndex >= config.puzzleCount) {
        setState("cleared");
        return;
      }

      setPuzzle(buildPuzzle(config));
      setPuzzleIndex(nextPuzzleIndex);
      return;
    }

    setWrongGridCount((current) => current + 1);
    setPuzzle((current) => ({
      ...current,
      availableNumbers: [...current.originalNumbers],
      currentGrid: createEmptyGrid(current.rowCount, current.columnCount),
    }));
  }, [config, puzzle, puzzleIndex, state]);

  return {
    beginRun,
    elapsedSeconds,
    puzzle,
    puzzleCount: config.puzzleCount,
    puzzleIndex,
    selectedNumber,
    selectNumber,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongGridCount,
    pressCell,
  };
}
