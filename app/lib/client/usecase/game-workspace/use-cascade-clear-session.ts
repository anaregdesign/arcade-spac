import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "planning" | "cleared" | "failed";
type TriggerKind = "row" | "column";
type CellColor = "amber" | "mint" | "plum" | "sky";
type BoardCell = CellColor | null;

type Trigger = {
  index: number;
  kind: TriggerKind;
};

type PuzzleConfig = {
  board: CellColor[][];
  id: string;
  moveLimit: number;
  optimalTrigger: Trigger;
  refillSequence: CellColor[];
  targetScore: number;
};

type DifficultyConfig = {
  puzzle: PuzzleConfig;
  timeLimitSeconds: number;
};

const puzzleRowBurst: PuzzleConfig = {
  board: [
    ["sky", "mint", "plum", "amber", "plum"],
    ["sky", "sky", "sky", "plum", "sky"],
    ["mint", "plum", "plum", "amber", "amber"],
    ["mint", "amber", "amber", "plum", "mint"],
    ["mint", "amber", "mint", "plum", "mint"],
  ],
  id: "row-burst",
  moveLimit: 2,
  optimalTrigger: { index: 2, kind: "row" },
  refillSequence: ["amber", "mint", "plum", "sky", "amber", "plum", "mint", "sky", "mint", "amber"],
  targetScore: 2200,
};

const puzzleColumnSurge: PuzzleConfig = {
  board: [
    ["amber", "plum", "amber", "plum", "amber"],
    ["mint", "sky", "plum", "mint", "amber"],
    ["amber", "plum", "plum", "amber", "plum"],
    ["plum", "sky", "sky", "sky", "mint"],
    ["amber", "plum", "plum", "sky", "amber"],
  ],
  id: "column-surge",
  moveLimit: 2,
  optimalTrigger: { index: 3, kind: "column" },
  refillSequence: ["amber", "mint", "plum", "sky", "amber", "sky", "plum", "mint", "sky", "mint"],
  targetScore: 1900,
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    puzzle: { ...puzzleColumnSurge, moveLimit: 3, targetScore: 900 },
    timeLimitSeconds: 58,
  },
  NORMAL: {
    puzzle: puzzleRowBurst,
    timeLimitSeconds: 68,
  },
  HARD: {
    puzzle: { ...puzzleColumnSurge, moveLimit: 2, targetScore: 1700 },
    timeLimitSeconds: 82,
  },
  EXPERT: {
    puzzle: { ...puzzleRowBurst, moveLimit: 1, targetScore: 5000 },
    timeLimitSeconds: 94,
  },
};

function cloneBoard(board: BoardCell[][]) {
  return board.map((row) => [...row]);
}

function collapseAndRefill(board: BoardCell[][], refillSequence: CellColor[], refillCursor: number) {
  const rowCount = board.length;
  const columnCount = board[0]?.length ?? 0;
  const nextBoard = Array.from({ length: rowCount }, () => Array<BoardCell>(columnCount).fill(null));
  let nextCursor = refillCursor;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const presentCells: CellColor[] = [];

    for (let rowIndex = rowCount - 1; rowIndex >= 0; rowIndex -= 1) {
      const value = board[rowIndex][columnIndex];

      if (value) {
        presentCells.push(value);
      }
    }

    let writeRowIndex = rowCount - 1;

    for (const value of presentCells) {
      nextBoard[writeRowIndex][columnIndex] = value;
      writeRowIndex -= 1;
    }

    while (writeRowIndex >= 0) {
      nextBoard[writeRowIndex][columnIndex] = refillSequence[nextCursor % refillSequence.length];
      nextCursor += 1;
      writeRowIndex -= 1;
    }
  }

  return {
    board: nextBoard,
    refillCursor: nextCursor,
  };
}

function collectConnectedGroups(board: BoardCell[][]) {
  const rowCount = board.length;
  const columnCount = board[0]?.length ?? 0;
  const visited = Array.from({ length: rowCount }, () => Array(columnCount).fill(false));
  const groups: Array<{ color: CellColor; cells: Array<{ column: number; row: number }> }> = [];
  const directions = [
    { column: 1, row: 0 },
    { column: -1, row: 0 },
    { column: 0, row: 1 },
    { column: 0, row: -1 },
  ];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const color = board[rowIndex][columnIndex];

      if (!color || visited[rowIndex][columnIndex]) {
        continue;
      }

      const stack = [{ column: columnIndex, row: rowIndex }];
      const cells: Array<{ column: number; row: number }> = [];
      visited[rowIndex][columnIndex] = true;

      while (stack.length > 0) {
        const current = stack.pop()!;

        cells.push(current);

        for (const direction of directions) {
          const nextColumn = current.column + direction.column;
          const nextRow = current.row + direction.row;

          if (nextColumn < 0 || nextRow < 0 || nextColumn >= columnCount || nextRow >= rowCount) {
            continue;
          }

          if (visited[nextRow][nextColumn] || board[nextRow][nextColumn] !== color) {
            continue;
          }

          visited[nextRow][nextColumn] = true;
          stack.push({ column: nextColumn, row: nextRow });
        }
      }

      if (cells.length >= 3) {
        groups.push({ cells, color });
      }
    }
  }

  return groups;
}

function resolveTrigger(board: BoardCell[][], puzzle: PuzzleConfig, refillCursor: number, trigger: Trigger) {
  const nextBoard = cloneBoard(board);
  const clearedCells = new Set<string>();

  if (trigger.kind === "row") {
    for (let columnIndex = 0; columnIndex < nextBoard[0].length; columnIndex += 1) {
      nextBoard[trigger.index][columnIndex] = null;
      clearedCells.add(`${trigger.index}-${columnIndex}`);
    }
  } else {
    for (let rowIndex = 0; rowIndex < nextBoard.length; rowIndex += 1) {
      nextBoard[rowIndex][trigger.index] = null;
      clearedCells.add(`${rowIndex}-${trigger.index}`);
    }
  }

  let scoreGain = clearedCells.size * 20;
  let cascadeDepth = 1;
  let collapseResult = collapseAndRefill(nextBoard, puzzle.refillSequence, refillCursor);
  let resolvedBoard = collapseResult.board;
  let nextRefillCursor = collapseResult.refillCursor;

  while (true) {
    const groups = collectConnectedGroups(resolvedBoard);

    if (groups.length === 0) {
      break;
    }

    cascadeDepth += 1;

    for (const group of groups) {
      scoreGain += group.cells.length * 10 * cascadeDepth;

      for (const cell of group.cells) {
        resolvedBoard[cell.row][cell.column] = null;
      }
    }

    collapseResult = collapseAndRefill(resolvedBoard, puzzle.refillSequence, nextRefillCursor);
    resolvedBoard = collapseResult.board;
    nextRefillCursor = collapseResult.refillCursor;
  }

  return {
    board: resolvedBoard,
    cascadeDepth,
    refillCursor: nextRefillCursor,
    scoreGain,
    triggerLabel: `${trigger.kind === "row" ? "Row" : "Column"} ${trigger.index + 1}`,
  };
}

export function useCascadeClearSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [board, setBoard] = useState<BoardCell[][]>(() => cloneBoard(config.puzzle.board));
  const [bestCascadeCount, setBestCascadeCount] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastCascadeDepth, setLastCascadeDepth] = useState(0);
  const [lastScoreGain, setLastScoreGain] = useState(0);
  const [lastTriggerLabel, setLastTriggerLabel] = useState("No trigger yet");
  const [moveCount, setMoveCount] = useState(0);
  const [refillCursor, setRefillCursor] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setBoard(cloneBoard(config.puzzle.board));
    setBestCascadeCount(0);
    setCurrentScore(0);
    setElapsedSeconds(0);
    setLastCascadeDepth(0);
    setLastScoreGain(0);
    setLastTriggerLabel("No trigger yet");
    setMoveCount(0);
    setRefillCursor(0);
    setState("idle");
  }, [config]);

  useEffect(() => {
    if (state !== "planning") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "planning" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    setBoard(cloneBoard(config.puzzle.board));
    setBestCascadeCount(0);
    setCurrentScore(0);
    setElapsedSeconds(0);
    setLastCascadeDepth(0);
    setLastScoreGain(0);
    setLastTriggerLabel("No trigger yet");
    setMoveCount(0);
    setRefillCursor(0);
    setState("planning");
  }

  function fireTrigger(kind: TriggerKind, index: number) {
    if (state !== "planning") {
      return "ignored" as const;
    }

    const resolution = resolveTrigger(board, config.puzzle, refillCursor, { index, kind });
    const nextMoveCount = moveCount + 1;
    const nextScore = currentScore + resolution.scoreGain;
    const nextBestCascade = Math.max(bestCascadeCount, resolution.cascadeDepth);

    setBoard(resolution.board);
    setBestCascadeCount(nextBestCascade);
    setCurrentScore(nextScore);
    setLastCascadeDepth(resolution.cascadeDepth);
    setLastScoreGain(resolution.scoreGain);
    setLastTriggerLabel(resolution.triggerLabel);
    setMoveCount(nextMoveCount);
    setRefillCursor(resolution.refillCursor);

    if (nextScore >= config.puzzle.targetScore) {
      setState("cleared");
      return "cleared" as const;
    }

    if (nextMoveCount >= config.puzzle.moveLimit) {
      setState("failed");
      return "failed" as const;
    }

    return "resolved" as const;
  }

  return {
    beginRun,
    bestCascadeCount,
    board,
    columnCount: board[0]?.length ?? 0,
    currentScore,
    elapsedSeconds,
    fireTrigger,
    lastCascadeDepth,
    lastScoreGain,
    lastTriggerLabel,
    moveCount,
    movesRemaining: Math.max(0, config.puzzle.moveLimit - moveCount),
    optimalTrigger: config.puzzle.optimalTrigger,
    rowCount: board.length,
    state,
    targetScore: config.puzzle.targetScore,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
