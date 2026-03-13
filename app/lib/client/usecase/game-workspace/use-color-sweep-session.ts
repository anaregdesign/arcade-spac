import { useEffect, useMemo, useState } from "react";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type PaletteKey = "amber" | "coral" | "mint" | "plum" | "sky" | "slate";

type Cell = {
  colorKey: PaletteKey;
  id: string;
  isCleared: boolean;
  isTarget: boolean;
};

type SessionBoard = {
  board: Cell[][];
  targetColorKey: PaletteKey;
};

const paletteOrder: PaletteKey[] = ["amber", "coral", "mint", "sky", "plum", "slate"];

const difficultyConfig: Record<Difficulty, { colorCount: number; columns: number; rows: number; targetCount: number; timeLimitSeconds: number }> = {
  EASY: { colorCount: 3, columns: 4, rows: 4, targetCount: 5, timeLimitSeconds: 18 },
  NORMAL: { colorCount: 4, columns: 5, rows: 5, targetCount: 7, timeLimitSeconds: 24 },
  HARD: { colorCount: 5, columns: 6, rows: 5, targetCount: 10, timeLimitSeconds: 32 },
  EXPERT: { colorCount: 6, columns: 6, rows: 6, targetCount: 12, timeLimitSeconds: 40 },
};

function cloneBoard(board: Cell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function createPreviewBoard(rows: number, columns: number, colorCount: number, targetCount: number): SessionBoard {
  const palette = paletteOrder.slice(0, colorCount);
  const targetColorKey = palette[0];
  const targetPositions = new Set<number>();

  for (let index = 0; index < rows * columns && targetPositions.size < targetCount; index += 1) {
    if (index % 3 === 0 || index % 5 === 0) {
      targetPositions.add(index);
    }
  }

  const board = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, columnIndex) => {
      const flatIndex = rowIndex * columns + columnIndex;
      const isTarget = targetPositions.has(flatIndex);

      return {
        colorKey: isTarget ? targetColorKey : palette[(flatIndex + rowIndex) % palette.length],
        id: `preview-${rowIndex}-${columnIndex}`,
        isCleared: false,
        isTarget,
      };
    }),
  );

  return {
    board,
    targetColorKey,
  };
}

function pickRandomIndices(total: number, count: number) {
  const selected = new Set<number>();

  while (selected.size < count) {
    selected.add(Math.floor(Math.random() * total));
  }

  return selected;
}

function createLiveBoard(rows: number, columns: number, colorCount: number, targetCount: number): SessionBoard {
  const palette = paletteOrder.slice(0, colorCount);
  const targetColorKey = palette[Math.floor(Math.random() * palette.length)];
  const targetPositions = pickRandomIndices(rows * columns, targetCount);
  const nonTargetPalette = palette.filter((colorKey) => colorKey !== targetColorKey);
  const board = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, columnIndex) => {
      const flatIndex = rowIndex * columns + columnIndex;
      const isTarget = targetPositions.has(flatIndex);

      return {
        colorKey: isTarget
          ? targetColorKey
          : nonTargetPalette[Math.floor(Math.random() * nonTargetPalette.length)],
        id: `live-${rowIndex}-${columnIndex}`,
        isCleared: false,
        isTarget,
      };
    }),
  );

  return {
    board,
    targetColorKey,
  };
}

export function useColorSweepSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [board, setBoard] = useState<Cell[][]>(() => createPreviewBoard(config.rows, config.columns, config.colorCount, config.targetCount).board);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingTargetCount, setRemainingTargetCount] = useState(config.targetCount);
  const [state, setState] = useState<SessionState>("idle");
  const [targetColorKey, setTargetColorKey] = useState<PaletteKey>("amber");
  const [wrongTapCount, setWrongTapCount] = useState(0);

  useEffect(() => {
    const preview = createPreviewBoard(config.rows, config.columns, config.colorCount, config.targetCount);
    setBoard(preview.board);
    setElapsedSeconds(0);
    setRemainingTargetCount(config.targetCount);
    setState("idle");
    setTargetColorKey(preview.targetColorKey);
    setWrongTapCount(0);
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((currentValue) => {
        const nextValue = Math.min(config.timeLimitSeconds, currentValue + 1);

        if (nextValue >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return nextValue;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    const next = createLiveBoard(config.rows, config.columns, config.colorCount, config.targetCount);
    setBoard(next.board);
    setElapsedSeconds(0);
    setRemainingTargetCount(config.targetCount);
    setState("playing");
    setTargetColorKey(next.targetColorKey);
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

    if (!currentCell.isTarget) {
      setWrongTapCount((currentValue) => currentValue + 1);
      return;
    }

    const nextBoard = cloneBoard(board);
    nextBoard[rowIndex][columnIndex].isCleared = true;
    const nextRemaining = Math.max(0, remainingTargetCount - 1);

    setBoard(nextBoard);
    setRemainingTargetCount(nextRemaining);

    if (nextRemaining === 0) {
      setState("cleared");
    }
  }

  return {
    beginRun,
    board,
    columns: config.columns,
    elapsedSeconds,
    remainingTargetCount,
    state,
    targetColorKey,
    targetCount: config.targetCount,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongTapCount,
    tapCell,
  };
}
