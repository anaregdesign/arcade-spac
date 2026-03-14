import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { pickDistinctIndices, randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type Cell = {
  id: string;
  isCleared: boolean;
  isTarget: boolean;
  symbol: string;
};

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  symbolCount: number;
  targetCount: number;
  timeLimitSeconds: number;
};

const symbolPalette = ["◆", "○", "△", "✦", "□", "✕", "●", "✳"] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 4, rowCount: 4, symbolCount: 4, targetCount: 5, timeLimitSeconds: 24 },
  NORMAL: { columnCount: 5, rowCount: 4, symbolCount: 5, targetCount: 7, timeLimitSeconds: 34 },
  HARD: { columnCount: 5, rowCount: 5, symbolCount: 6, targetCount: 9, timeLimitSeconds: 46 },
  EXPERT: { columnCount: 6, rowCount: 5, symbolCount: 7, targetCount: 11, timeLimitSeconds: 58 },
};

function createPreviewBoard(config: DifficultyConfig) {
  const totalCellCount = config.rowCount * config.columnCount;
  const targetSymbol = symbolPalette[0];
  const targetIndices = new Set<number>(Array.from({ length: config.targetCount }, (_, index) => (index * 3) % totalCellCount));
  const board = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const flatIndex = rowIndex * config.columnCount + columnIndex;
      const isTarget = targetIndices.has(flatIndex);

      return {
        id: `symbol-preview-${rowIndex}-${columnIndex}`,
        isCleared: false,
        isTarget,
        symbol: isTarget ? targetSymbol : symbolPalette[(flatIndex + rowIndex + 1) % config.symbolCount],
      };
    }),
  );

  return { board, targetSymbol };
}

function createLiveBoard(config: DifficultyConfig) {
  const totalCellCount = config.rowCount * config.columnCount;
  const palette = symbolPalette.slice(0, config.symbolCount);
  const targetSymbol = palette[randomInt(palette.length)];
  const targetIndices = new Set<number>(pickDistinctIndices(totalCellCount, config.targetCount));
  const nonTargetPalette = palette.filter((symbol) => symbol !== targetSymbol);
  const board = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const flatIndex = rowIndex * config.columnCount + columnIndex;
      const isTarget = targetIndices.has(flatIndex);

      return {
        id: `symbol-live-${rowIndex}-${columnIndex}`,
        isCleared: false,
        isTarget,
        symbol: isTarget ? targetSymbol : nonTargetPalette[randomInt(nonTargetPalette.length)],
      };
    }),
  );

  return { board, targetSymbol };
}

function cloneBoard(board: Cell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function useSymbolHuntSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const preview = useMemo(() => createPreviewBoard(config), [config]);
  const [board, setBoard] = useState<Cell[][]>(preview.board);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingTargetCount, setRemainingTargetCount] = useState(config.targetCount);
  const [state, setState] = useState<SessionState>("idle");
  const [targetSymbol, setTargetSymbol] = useState<string>(preview.targetSymbol);
  const [wrongTapCount, setWrongTapCount] = useState(0);

  useEffect(() => {
    setBoard(preview.board);
    setElapsedSeconds(0);
    setRemainingTargetCount(config.targetCount);
    setState("idle");
    setTargetSymbol(preview.targetSymbol);
    setWrongTapCount(0);
  }, [config, preview]);

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
    const next = createLiveBoard(config);
    setBoard(next.board);
    setElapsedSeconds(0);
    setRemainingTargetCount(config.targetCount);
    setState("playing");
    setTargetSymbol(next.targetSymbol);
    setWrongTapCount(0);
  }

  function tapCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored";
    }

    const currentCell = board[rowIndex]?.[columnIndex];

    if (!currentCell || currentCell.isCleared) {
      return "ignored";
    }

    if (!currentCell.isTarget) {
      setWrongTapCount((current) => current + 1);
      return "wrong";
    }

    const nextBoard = cloneBoard(board);
    nextBoard[rowIndex][columnIndex].isCleared = true;
    const nextRemaining = Math.max(0, remainingTargetCount - 1);

    setBoard(nextBoard);
    setRemainingTargetCount(nextRemaining);

    if (nextRemaining === 0) {
      setState("cleared");
    }

    return "correct";
  }

  return {
    beginRun,
    board,
    columnCount: config.columnCount,
    elapsedSeconds,
    remainingTargetCount,
    state,
    targetCount: config.targetCount,
    targetSymbol,
    tapCell,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongTapCount,
  };
}
