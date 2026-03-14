import { useEffect, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import { subscribeWindowKeydown } from "../../infrastructure/browser/window-keydown";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";

type SessionState = "idle" | "playing" | "cleared";

type SudokuCell = {
  colIndex: number;
  isFixed: boolean;
  isSelected: boolean;
  isWrong: boolean;
  rowIndex: number;
  solutionValue: number;
  value: number;
};

type PuzzleDefinition = {
  givens: string;
  solution: string;
};

const puzzleByDifficulty: Record<Difficulty, PuzzleDefinition> = {
  EASY: {
    givens: "530678912672195348198342560859761423426853791713020856961537284287419635345286079",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  NORMAL: {
    givens: "530070912600195348198002560859760023426050791703020856060537204287419005345080079",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  HARD: {
    givens: "000070900600100300100002060800700003020050090703000800060500200080019005300000070",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  EXPERT: {
    givens: "000000000070195000008000560800060003020000090003000800060500200000010005300000000",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
};

function buildBoard(puzzle: PuzzleDefinition, selectedCell: { colIndex: number; rowIndex: number } | null, wrongCellKey: string | null) {
  return Array.from({ length: 9 }, (_, rowIndex) =>
    Array.from({ length: 9 }, (_, colIndex) => {
      const index = rowIndex * 9 + colIndex;
      const givenValue = Number(puzzle.givens[index] ?? "0");
      const solutionValue = Number(puzzle.solution[index] ?? "0");
      const isSelected = selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex;

      return {
        colIndex,
        isFixed: givenValue > 0,
        isSelected,
        isWrong: wrongCellKey === `${rowIndex}:${colIndex}`,
        rowIndex,
        solutionValue,
        value: givenValue,
      } satisfies SudokuCell;
    }),
  );
}

function cloneBoard(board: SudokuCell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function findFirstEditableCell(board: SudokuCell[][]) {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isFixed && cell.value === 0) {
        return { rowIndex: cell.rowIndex, colIndex: cell.colIndex };
      }
    }
  }

  return null;
}

function isSolved(board: SudokuCell[][]) {
  return board.every((row) => row.every((cell) => cell.value === cell.solutionValue));
}

export function useSudokuSession(difficulty: Difficulty) {
  const [board, setBoard] = useState<SudokuCell[][]>(() => buildBoard(puzzleByDifficulty[difficulty], null, null));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ colIndex: number; rowIndex: number } | null>(null);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongCellKey, setWrongCellKey] = useState<string | null>(null);

  useEffect(() => {
    setBoard(buildBoard(puzzleByDifficulty[difficulty], null, null));
    setElapsedSeconds(0);
    setHintCount(0);
    setMistakeCount(0);
    setSelectedCell(null);
    setState("idle");
    setWrongCellKey(null);
  }, [difficulty]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [state]);

  useEffect(() => {
    if (!wrongCellKey) {
      return undefined;
    }

    const timeout = startBrowserTimeout(() => {
      setWrongCellKey(null);
    }, 500);

    return () => clearBrowserTimeout(timeout);
  }, [wrongCellKey]);

  useEffect(() => {
    if (state !== "playing" || !selectedCell) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key >= "1" && event.key <= "9") {
        event.preventDefault();
        applyDigit(Number(event.key));
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
        event.preventDefault();
        clearSelectedCell();
        return;
      }

      if (event.key.toLowerCase() === "h") {
        event.preventDefault();
        useHint();
      }
    }

    return subscribeWindowKeydown(handleKeyDown);
  }, [board, selectedCell, state]);

  function resetBoard() {
    setBoard(buildBoard(puzzleByDifficulty[difficulty], null, null));
    setElapsedSeconds(0);
    setHintCount(0);
    setMistakeCount(0);
    setSelectedCell(null);
    setState("idle");
    setWrongCellKey(null);
  }

  function beginRun() {
    const nextBoard = buildBoard(puzzleByDifficulty[difficulty], null, null);
    const firstEditableCell = findFirstEditableCell(nextBoard);

    setBoard(nextBoard);
    setElapsedSeconds(0);
    setHintCount(0);
    setMistakeCount(0);
    setSelectedCell(firstEditableCell);
    setState("playing");
    setWrongCellKey(null);
  }

  function selectCell(rowIndex: number, colIndex: number) {
    if (state !== "playing") {
      return;
    }

    setSelectedCell({ rowIndex, colIndex });
  }

  function applyDigit(value: number) {
    if (state !== "playing" || !selectedCell) {
      return;
    }

    const nextBoard = cloneBoard(board);
    const cell = nextBoard[selectedCell.rowIndex][selectedCell.colIndex];

    if (cell.isFixed) {
      setBoard(nextBoard);
      return;
    }

    if (cell.solutionValue !== value) {
      setMistakeCount((current) => current + 1);
      setWrongCellKey(`${cell.rowIndex}:${cell.colIndex}`);
      return;
    }

    cell.value = value;
    setWrongCellKey(null);

    if (isSolved(nextBoard)) {
      setState("cleared");
    }

    setBoard(nextBoard);
  }

  function clearSelectedCell() {
    if (state !== "playing" || !selectedCell) {
      return;
    }

    const nextBoard = cloneBoard(board);
    const cell = nextBoard[selectedCell.rowIndex][selectedCell.colIndex];

    if (cell.isFixed) {
      setBoard(nextBoard);
      return;
    }

    cell.value = 0;
    setBoard(nextBoard);
    setWrongCellKey(null);
  }

  function useHint() {
    if (state !== "playing") {
      return;
    }

    const nextBoard = cloneBoard(board);
    const preferredCell = selectedCell ? nextBoard[selectedCell.rowIndex][selectedCell.colIndex] : null;
    const hintCell = preferredCell && !preferredCell.isFixed && preferredCell.value === 0
      ? preferredCell
      : nextBoard.flat().find((cell) => !cell.isFixed && cell.value === 0);

    if (!hintCell) {
      setBoard(nextBoard);
      return;
    }

    hintCell.value = hintCell.solutionValue;
    setSelectedCell({ rowIndex: hintCell.rowIndex, colIndex: hintCell.colIndex });
    setHintCount((current) => current + 1);
    setWrongCellKey(null);

    if (isSolved(nextBoard)) {
      setState("cleared");
    }

    setBoard(nextBoard);
  }

  const remainingCellCount = board.flat().filter((cell) => !cell.isFixed && cell.value === 0).length;

  return {
    applyDigit,
    beginRun,
    board,
    clearSelectedCell,
    elapsedSeconds,
    hintCount,
    mistakeCount,
    remainingCellCount,
    resetBoard,
    selectCell,
    selectedCell,
    state,
    useHint,
  };
}
