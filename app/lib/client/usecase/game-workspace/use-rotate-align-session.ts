import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type Direction = "east" | "north" | "south" | "west";
type TileShape = "corner" | "empty" | "end" | "straight";

export type RotateAlignCell = {
  columnIndex: number;
  currentRotation: number;
  id: string;
  isEnd: boolean;
  isStart: boolean;
  rowIndex: number;
  shape: TileShape;
  solutionConnectors: Direction[];
};

type RotateAlignRound = {
  board: RotateAlignCell[][];
};

type DifficultyConfig = {
  columnCount: number;
  maxVerticalTravel: number;
  roundCount: number;
  rowCount: number;
  timeLimitSeconds: number;
};

type GridPoint = {
  columnIndex: number;
  rowIndex: number;
};

const directionOrder = ["north", "east", "south", "west"] as const satisfies readonly Direction[];
const canonicalConnectorsByShape: Record<TileShape, Direction[]> = {
  corner: ["east", "south"],
  empty: [],
  end: ["east"],
  straight: ["east", "west"],
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 4, maxVerticalTravel: 1, roundCount: 3, rowCount: 3, timeLimitSeconds: 38 },
  NORMAL: { columnCount: 5, maxVerticalTravel: 1, roundCount: 4, rowCount: 3, timeLimitSeconds: 50 },
  HARD: { columnCount: 5, maxVerticalTravel: 2, roundCount: 5, rowCount: 4, timeLimitSeconds: 64 },
  EXPERT: { columnCount: 6, maxVerticalTravel: 2, roundCount: 6, rowCount: 4, timeLimitSeconds: 78 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rotateDirection(direction: Direction, rotation: number) {
  const currentIndex = directionOrder.indexOf(direction);

  return directionOrder[(currentIndex + rotation + directionOrder.length * 4) % directionOrder.length];
}

function normalizeConnectors(connectors: readonly Direction[]) {
  return [...connectors]
    .sort((left, right) => directionOrder.indexOf(left) - directionOrder.indexOf(right))
    .join("-");
}

function getCurrentConnectors(cell: RotateAlignCell) {
  return canonicalConnectorsByShape[cell.shape].map((direction) => rotateDirection(direction, cell.currentRotation));
}

function directionsBetween(current: GridPoint, next: GridPoint): Direction {
  if (next.rowIndex < current.rowIndex) {
    return "north";
  }

  if (next.rowIndex > current.rowIndex) {
    return "south";
  }

  if (next.columnIndex < current.columnIndex) {
    return "west";
  }

  return "east";
}

function getShapeForConnectors(connectors: Direction[]) {
  if (connectors.length === 0) {
    return { shape: "empty" as const, solutionRotation: 0 };
  }

  for (const shape of ["end", "straight", "corner"] as const) {
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const rotated = canonicalConnectorsByShape[shape].map((direction) => rotateDirection(direction, rotation));

      if (normalizeConnectors(rotated) === normalizeConnectors(connectors)) {
        return { shape, solutionRotation: rotation };
      }
    }
  }

  return { shape: "empty" as const, solutionRotation: 0 };
}

function buildPath(config: DifficultyConfig, roundIndex: number, preview = false) {
  const path: GridPoint[] = [];
  const previewVerticalPattern = [1, 0, -1, 1, -1, 0];
  let rowIndex = preview ? Math.min(1, config.rowCount - 1) : randomInt(config.rowCount);

  path.push({ columnIndex: 0, rowIndex });

  for (let columnIndex = 0; columnIndex < config.columnCount - 1; columnIndex += 1) {
    const maxShift = preview
      ? 1
      : Math.min(config.maxVerticalTravel, 1 + Math.floor(roundIndex / 2));
    const shift = preview
      ? previewVerticalPattern[columnIndex % previewVerticalPattern.length]
      : randomInt(maxShift * 2 + 1) - maxShift;
    const targetRowIndex = clamp(rowIndex + shift, 0, config.rowCount - 1);

    while (rowIndex < targetRowIndex) {
      rowIndex += 1;
      path.push({ columnIndex, rowIndex });
    }

    while (rowIndex > targetRowIndex) {
      rowIndex -= 1;
      path.push({ columnIndex, rowIndex });
    }

    path.push({ columnIndex: columnIndex + 1, rowIndex });
  }

  return path;
}

function createRound(config: DifficultyConfig, roundIndex: number, preview = false): RotateAlignRound {
  const path = buildPath(config, roundIndex, preview);
  const pathKeySet = new Set(path.map((point) => `${point.rowIndex}:${point.columnIndex}`));
  const board = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const pointIndex = path.findIndex((point) => point.rowIndex === rowIndex && point.columnIndex === columnIndex);

      if (!pathKeySet.has(`${rowIndex}:${columnIndex}`) || pointIndex === -1) {
        return {
          columnIndex,
          currentRotation: 0,
          id: `rotate-align-${preview ? "preview" : "live"}-${roundIndex}-${rowIndex}-${columnIndex}`,
          isEnd: false,
          isStart: false,
          rowIndex,
          shape: "empty" as const,
          solutionConnectors: [],
        };
      }

      const currentPoint = path[pointIndex];
      const previousPoint = path[pointIndex - 1];
      const nextPoint = path[pointIndex + 1];
      const solutionConnectors = [
        pointIndex === 0 ? "west" : directionsBetween(currentPoint, previousPoint),
        pointIndex === path.length - 1 ? "east" : directionsBetween(currentPoint, nextPoint),
      ];
      const { shape, solutionRotation } = getShapeForConnectors(solutionConnectors);
      const offset = shape === "straight"
        ? 1
        : preview
          ? ((pointIndex % 3) + 1)
          : (randomInt(3) + 1);

      return {
        columnIndex,
        currentRotation: shape === "empty" ? 0 : (solutionRotation + offset) % 4,
        id: `rotate-align-${preview ? "preview" : "live"}-${roundIndex}-${rowIndex}-${columnIndex}`,
        isEnd: pointIndex === path.length - 1,
        isStart: pointIndex === 0,
        rowIndex,
        shape,
        solutionConnectors,
      };
    }),
  );

  return { board };
}

function isRoundSolved(board: RotateAlignCell[][]) {
  return board.every((row) =>
    row.every((cell) => normalizeConnectors(getCurrentConnectors(cell)) === normalizeConnectors(cell.solutionConnectors)));
}

function rotateBoardCell(board: RotateAlignCell[][], rowIndex: number, columnIndex: number) {
  return board.map((row, nextRowIndex) =>
    row.map((cell, nextColumnIndex) =>
      nextRowIndex === rowIndex && nextColumnIndex === columnIndex
        ? { ...cell, currentRotation: (cell.currentRotation + 1) % 4 }
        : cell,
    ),
  );
}

export function useRotateAlignSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewRound = useMemo(() => createRound(config, 0, true), [config]);
  const [board, setBoard] = useState<RotateAlignCell[][]>(() => previewRound.board);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rotationCount, setRotationCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setBoard(previewRound.board);
    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setRotationCount(0);
    setState("idle");
  }, [previewRound]);

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

  function openRound(roundIndex: number) {
    const round = createRound(config, roundIndex);

    setBoard(round.board);
    setCurrentRoundIndex(roundIndex);
  }

  function beginRun() {
    setElapsedSeconds(0);
    setRotationCount(0);
    setState("playing");
    openRound(0);
  }

  function rotateTile(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const cell = board[rowIndex]?.[columnIndex];

    if (!cell || cell.shape === "empty") {
      return "ignored" as const;
    }

    const nextBoard = rotateBoardCell(board, rowIndex, columnIndex);
    const nextRotationCount = rotationCount + 1;

    setBoard(nextBoard);
    setRotationCount(nextRotationCount);

    if (!isRoundSolved(nextBoard)) {
      return "rotated" as const;
    }

    const nextRoundIndex = currentRoundIndex + 1;

    if (nextRoundIndex >= config.roundCount) {
      setState("cleared");
      return "rotated" as const;
    }

    openRound(nextRoundIndex);
    return "rotated" as const;
  }

  return {
    beginRun,
    board,
    columnCount: config.columnCount,
    currentRoundIndex,
    elapsedSeconds,
    rotationCount,
    roundCount: config.roundCount,
    rowCount: config.rowCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    rotateTile,
  };
}
