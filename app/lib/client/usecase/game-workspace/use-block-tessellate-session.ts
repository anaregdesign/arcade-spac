import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type MoveDirection = "left" | "right";
type PieceShape = "bar-3" | "elbow-3" | "l-block" | "square-4";
type PieceTheme = "amber" | "cyan" | "lime" | "pink" | "violet";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type ActionResult = "cleared" | "ignored" | "misdrop" | "moved" | "placed";

type CellPoint = {
  column: number;
  row: number;
};

type RawPieceDefinition = {
  id: string;
  label: string;
  shape: PieceShape;
  solutionAnchorSlot: number;
  solutionRotation: number;
  theme: PieceTheme;
};

type PieceDefinition = RawPieceDefinition & {
  baseCells: CellPoint[];
  cellCount: number;
};

type PuzzleDefinition = {
  columnCount: number;
  id: string;
  name: string;
  queue: PieceDefinition[];
  rowCount: number;
  targetSlots: number[];
};

type DifficultyConfig = {
  fallTickMs: number;
  puzzles: PuzzleDefinition[];
  timeLimitSeconds: number;
};

type ActivePiece = {
  column: number;
  index: number;
  pieceId: string;
  rotation: number;
  row: number;
};

type LockedPlacement = {
  pieceId: string;
  slots: number[];
};

export type BlockTessellateBoardCell = {
  column: number;
  label: string | null;
  row: number;
  slot: number;
  state: "active" | "filled" | "preview" | "target-empty" | "void";
  theme: PieceTheme | null;
};

const baseCellsByShape: Record<PieceShape, CellPoint[]> = {
  "bar-3": [
    { column: 0, row: 0 },
    { column: 1, row: 0 },
    { column: 2, row: 0 },
  ],
  "elbow-3": [
    { column: 0, row: 0 },
    { column: 0, row: 1 },
    { column: 1, row: 1 },
  ],
  "l-block": [
    { column: 0, row: 0 },
    { column: 0, row: 1 },
    { column: 0, row: 2 },
    { column: 1, row: 2 },
  ],
  "square-4": [
    { column: 0, row: 0 },
    { column: 1, row: 0 },
    { column: 0, row: 1 },
    { column: 1, row: 1 },
  ],
};

const rawPuzzles = [
  {
    columnCount: 5,
    id: "harbor-drop",
    name: "Harbor Drop",
    queue: [
      { id: "piece-amber-bar", label: "A", shape: "bar-3", solutionAnchorSlot: 25, solutionRotation: 0, theme: "amber" },
      { id: "piece-cyan-square", label: "B", shape: "square-4", solutionAnchorSlot: 23, solutionRotation: 0, theme: "cyan" },
      { id: "piece-lime-elbow", label: "C", shape: "elbow-3", solutionAnchorSlot: 15, solutionRotation: 1, theme: "lime" },
      { id: "piece-pink-bar", label: "D", shape: "bar-3", solutionAnchorSlot: 12, solutionRotation: 1, theme: "pink" },
    ],
    rowCount: 6,
  },
  {
    columnCount: 5,
    id: "corner-stack",
    name: "Corner Stack",
    queue: [
      { id: "piece-violet-l", label: "A", shape: "l-block", solutionAnchorSlot: 18, solutionRotation: 0, theme: "violet" },
      { id: "piece-amber-bar", label: "B", shape: "bar-3", solutionAnchorSlot: 25, solutionRotation: 0, theme: "amber" },
      { id: "piece-cyan-square", label: "C", shape: "square-4", solutionAnchorSlot: 15, solutionRotation: 0, theme: "cyan" },
      { id: "piece-lime-elbow", label: "D", shape: "elbow-3", solutionAnchorSlot: 7, solutionRotation: 3, theme: "lime" },
    ],
    rowCount: 6,
  },
] as const;

const hydratedPuzzleA = hydratePuzzle(rawPuzzles[0]);
const hydratedPuzzleB = hydratePuzzle(rawPuzzles[1]);

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    fallTickMs: 620,
    puzzles: [hydratedPuzzleA],
    timeLimitSeconds: 58,
  },
  NORMAL: {
    fallTickMs: 560,
    puzzles: [hydratedPuzzleA, hydratedPuzzleB],
    timeLimitSeconds: 74,
  },
  HARD: {
    fallTickMs: 500,
    puzzles: [hydratedPuzzleA, hydratedPuzzleB, hydratedPuzzleA],
    timeLimitSeconds: 88,
  },
  EXPERT: {
    fallTickMs: 440,
    puzzles: [hydratedPuzzleB, hydratedPuzzleA, hydratedPuzzleB],
    timeLimitSeconds: 102,
  },
};

function normalizeCells(cells: CellPoint[]) {
  const minimumRow = Math.min(...cells.map((cell) => cell.row));
  const minimumColumn = Math.min(...cells.map((cell) => cell.column));

  return cells
    .map((cell) => ({
      column: cell.column - minimumColumn,
      row: cell.row - minimumRow,
    }))
    .sort((left, right) => {
      if (left.row === right.row) {
        return left.column - right.column;
      }

      return left.row - right.row;
    });
}

function rotateCells(baseCells: CellPoint[], rotation: number) {
  let nextCells = baseCells;

  for (let index = 0; index < rotation % 4; index += 1) {
    nextCells = normalizeCells(
      nextCells.map((cell) => ({
        column: -cell.row,
        row: cell.column,
      })),
    );
  }

  return normalizeCells(nextCells);
}

function toSlot(row: number, column: number, columnCount: number) {
  return row * columnCount + column;
}

function hydratePuzzle(rawPuzzle: (typeof rawPuzzles)[number]): PuzzleDefinition {
  const queue = rawPuzzle.queue.map((piece) => ({
    ...piece,
    baseCells: normalizeCells(baseCellsByShape[piece.shape]),
    cellCount: baseCellsByShape[piece.shape].length,
  }));
  const targetSlots = Array.from(new Set(
    queue.flatMap((piece) => {
      const anchorRow = Math.floor(piece.solutionAnchorSlot / rawPuzzle.columnCount);
      const anchorColumn = piece.solutionAnchorSlot % rawPuzzle.columnCount;
      const rotatedCells = rotateCells(piece.baseCells, piece.solutionRotation);

      return rotatedCells.map((cell) => toSlot(anchorRow + cell.row, anchorColumn + cell.column, rawPuzzle.columnCount));
    }),
  )).sort((left, right) => left - right);

  return {
    columnCount: rawPuzzle.columnCount,
    id: rawPuzzle.id,
    name: rawPuzzle.name,
    queue,
    rowCount: rawPuzzle.rowCount,
    targetSlots,
  };
}

function getPieceWidth(piece: PieceDefinition, rotation: number) {
  const rotatedCells = rotateCells(piece.baseCells, rotation);

  return Math.max(...rotatedCells.map((cell) => cell.column)) + 1;
}

function resolveActiveSlots(
  piece: PieceDefinition,
  rotation: number,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
) {
  const rotatedCells = rotateCells(piece.baseCells, rotation);

  return rotatedCells.map((cell) => {
    const nextRow = row + cell.row;
    const nextColumn = column + cell.column;

    if (nextRow < 0 || nextColumn < 0 || nextRow >= rowCount || nextColumn >= columnCount) {
      return null;
    }

    return toSlot(nextRow, nextColumn, columnCount);
  });
}

function canOccupy(
  piece: PieceDefinition,
  rotation: number,
  row: number,
  column: number,
  puzzle: PuzzleDefinition,
  lockedPlacements: LockedPlacement[],
) {
  const resolvedSlots = resolveActiveSlots(piece, rotation, row, column, puzzle.rowCount, puzzle.columnCount);
  const occupiedSlots = new Set(lockedPlacements.flatMap((placement) => placement.slots));

  return resolvedSlots.every((slot): slot is number => slot !== null) && resolvedSlots.every((slot) => !occupiedSlots.has(slot));
}

function buildBoardCells(
  puzzle: PuzzleDefinition,
  lockedPlacements: LockedPlacement[],
  activeSlots: number[],
  previewSlots: number[],
  activeTheme: PieceTheme | null,
) {
  const targetSlotSet = new Set(puzzle.targetSlots);
  const activeSlotSet = new Set(activeSlots);
  const previewSlotSet = new Set(previewSlots);
  const lockedSlotMap = new Map<number, LockedPlacement>();

  for (const placement of lockedPlacements) {
    for (const slot of placement.slots) {
      lockedSlotMap.set(slot, placement);
    }
  }

  return Array.from({ length: puzzle.rowCount * puzzle.columnCount }, (_, slot): BlockTessellateBoardCell => {
    const lockedPlacement = lockedSlotMap.get(slot) ?? null;

    return {
      column: slot % puzzle.columnCount,
      label: lockedPlacement
        ? puzzle.queue.find((piece) => piece.id === lockedPlacement.pieceId)?.label ?? null
        : null,
      row: Math.floor(slot / puzzle.columnCount),
      slot,
      state: activeSlotSet.has(slot)
        ? "active"
        : lockedPlacement
          ? "filled"
          : previewSlotSet.has(slot)
            ? "preview"
            : targetSlotSet.has(slot)
              ? "target-empty"
              : "void",
      theme: activeSlotSet.has(slot)
        ? activeTheme
        : lockedPlacement
          ? puzzle.queue.find((piece) => piece.id === lockedPlacement.pieceId)?.theme ?? null
          : previewSlotSet.has(slot)
            ? activeTheme
          : null,
    };
  });
}

export function useBlockTessellateSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(() => createSpawnPiece(config.puzzles[0], 0));
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActionLabel, setLastActionLabel] = useState("No lock yet");
  const [lockedPlacements, setLockedPlacements] = useState<LockedPlacement[]>([]);
  const [misdropCount, setMisdropCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  const activePieceRef = useRef<ActivePiece | null>(createSpawnPiece(config.puzzles[0], 0));
  const currentPuzzleIndexRef = useRef(0);
  const lockedPlacementsRef = useRef<LockedPlacement[]>([]);
  const misdropCountRef = useRef(0);
  const stateRef = useRef<SessionState>("idle");
  const fallIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const puzzle = config.puzzles[currentPuzzleIndex] ?? config.puzzles[0];
  const activePieceDefinition = puzzle.queue[activePiece?.index ?? 0] ?? null;
  const activeSlots = activePiece && activePieceDefinition
    ? resolveActiveSlots(
        activePieceDefinition,
        activePiece.rotation,
        activePiece.row,
        activePiece.column,
        puzzle.rowCount,
        puzzle.columnCount,
      ).filter((slot): slot is number => slot !== null)
    : [];
  const previewSlots = activePiece && activePieceDefinition
    ? getDropPreviewSlots(activePiece, activePieceDefinition, puzzle, lockedPlacements)
    : [];
  const boardCells = useMemo(
    () => buildBoardCells(puzzle, lockedPlacements, activeSlots, previewSlots, activePieceDefinition?.theme ?? null),
    [activePieceDefinition, activeSlots, lockedPlacements, previewSlots, puzzle],
  );
  const filledCellCount = lockedPlacements.reduce((total, placement) => total + placement.slots.length, 0);
  const nextPieceDefinition = activePiece
    ? puzzle.queue[activePiece.index + 1] ?? null
    : null;

  function clearIntervals() {
    if (fallIntervalRef.current !== null) {
      clearBrowserInterval(fallIntervalRef.current);
      fallIntervalRef.current = null;
    }

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function setStateSafely(nextState: SessionState) {
    stateRef.current = nextState;
    setState(nextState);
  }

  function syncBoardReset(puzzleIndex: number, nextMisdropCount = misdropCountRef.current, nextState: SessionState = stateRef.current) {
    const livePuzzle = config.puzzles[puzzleIndex] ?? config.puzzles[0];
    const nextActivePiece = createSpawnPiece(livePuzzle, 0);

    currentPuzzleIndexRef.current = puzzleIndex;
    activePieceRef.current = nextActivePiece;
    lockedPlacementsRef.current = [];
    misdropCountRef.current = nextMisdropCount;
    stateRef.current = nextState;

    setCurrentPuzzleIndex(puzzleIndex);
    setActivePiece(nextActivePiece);
    setLockedPlacements([]);
    setMisdropCount(nextMisdropCount);
    setState(nextState);
  }

  function resetSession() {
    clearIntervals();
    syncBoardReset(0, 0, "idle");
    setElapsedSeconds(0);
    setLastActionLabel("No lock yet");
  }

  function beginRun() {
    clearIntervals();
    syncBoardReset(0, 0, "playing");
    setElapsedSeconds(0);
    setLastActionLabel(`${config.puzzles[0]?.name ?? "Board"} ready`);
  }

  function finishPuzzleOrQueue(nextLockedPlacements: LockedPlacement[], lastPieceLabel: string) {
    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const nextFilledCount = nextLockedPlacements.reduce((total, placement) => total + placement.slots.length, 0);

    if (nextFilledCount === livePuzzle.targetSlots.length) {
      if (currentPuzzleIndexRef.current < config.puzzles.length - 1) {
        const nextPuzzleIndex = currentPuzzleIndexRef.current + 1;
        syncBoardReset(nextPuzzleIndex, misdropCountRef.current, "playing");
        setLastActionLabel(`${config.puzzles[nextPuzzleIndex]?.name ?? "Board"} ready`);
        return "placed" as const;
      }

      clearIntervals();
      activePieceRef.current = null;
      setActivePiece(null);
      setStateSafely("cleared");
      setLastActionLabel(`${lastPieceLabel} sealed the silhouette`);
      return "cleared" as const;
    }

    const currentActivePiece = activePieceRef.current;
    const nextPieceIndex = (currentActivePiece?.index ?? 0) + 1;
    const nextSpawn = createSpawnPiece(livePuzzle, nextPieceIndex);

    if (!nextSpawn) {
      clearIntervals();
      activePieceRef.current = null;
      setActivePiece(null);
      setStateSafely("failed");
      setLastActionLabel("Spawn space blocked");
      return "ignored" as const;
    }

    activePieceRef.current = nextSpawn;
    setActivePiece(nextSpawn);
    setLastActionLabel(`${lastPieceLabel} locked`);

    return "placed" as const;
  }

  function lockActivePiece(): ActionResult {
    if (stateRef.current !== "playing" || !activePieceRef.current) {
      return "ignored";
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const livePiece = livePuzzle.queue[activePieceRef.current.index] ?? null;

    if (!livePiece) {
      return "ignored";
    }

    const slots = resolveActiveSlots(
      livePiece,
      activePieceRef.current.rotation,
      activePieceRef.current.row,
      activePieceRef.current.column,
      livePuzzle.rowCount,
      livePuzzle.columnCount,
    ).filter((slot): slot is number => slot !== null);
    const validLock = slots.every((slot) => livePuzzle.targetSlots.includes(slot))
      && slots.every((slot) => !lockedPlacementsRef.current.some((placement) => placement.slots.includes(slot)));

    if (!validLock) {
      const nextMisdropCount = misdropCountRef.current + 1;

      syncBoardReset(currentPuzzleIndexRef.current, nextMisdropCount, "playing");
      setLastActionLabel("Misdrop reset");

      return "misdrop";
    }

    const nextLockedPlacements = [
      ...lockedPlacementsRef.current,
      { pieceId: livePiece.id, slots },
    ];

    lockedPlacementsRef.current = nextLockedPlacements;
    setLockedPlacements(nextLockedPlacements);

    return finishPuzzleOrQueue(nextLockedPlacements, livePiece.label);
  }

  function advanceFall() {
    if (stateRef.current !== "playing" || !activePieceRef.current) {
      return;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const livePiece = livePuzzle.queue[activePieceRef.current.index] ?? null;

    if (!livePiece) {
      return;
    }

    if (canOccupy(
      livePiece,
      activePieceRef.current.rotation,
      activePieceRef.current.row + 1,
      activePieceRef.current.column,
      livePuzzle,
      lockedPlacementsRef.current,
    )) {
      const nextActivePiece = {
        ...activePieceRef.current,
        row: activePieceRef.current.row + 1,
      };

      activePieceRef.current = nextActivePiece;
      setActivePiece(nextActivePiece);
      return;
    }

    lockActivePiece();
  }

  useEffect(() => {
    return () => {
      clearIntervals();
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      clearIntervals();
      return;
    }

    fallIntervalRef.current = startBrowserInterval(advanceFall, config.fallTickMs);
    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          clearIntervals();
          setStateSafely("failed");
          setLastActionLabel("Time expired");
        }

        return next;
      });
    }, 1000);

    return () => {
      clearIntervals();
    };
  }, [config.fallTickMs, config.timeLimitSeconds, state]);

  function move(direction: MoveDirection) {
    if (stateRef.current !== "playing" || !activePieceRef.current) {
      return "ignored" as const;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const livePiece = livePuzzle.queue[activePieceRef.current.index] ?? null;
    const delta = direction === "left" ? -1 : 1;

    if (!livePiece || !canOccupy(
      livePiece,
      activePieceRef.current.rotation,
      activePieceRef.current.row,
      activePieceRef.current.column + delta,
      livePuzzle,
      lockedPlacementsRef.current,
    )) {
      return "ignored" as const;
    }

    const nextActivePiece = {
      ...activePieceRef.current,
      column: activePieceRef.current.column + delta,
    };

    activePieceRef.current = nextActivePiece;
    setActivePiece(nextActivePiece);
    setLastActionLabel(`${livePiece.label} moved ${direction}`);

    return "moved" as const;
  }

  function rotate() {
    if (stateRef.current !== "playing" || !activePieceRef.current) {
      return "ignored" as const;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const livePiece = livePuzzle.queue[activePieceRef.current.index] ?? null;
    const nextRotation = ((activePieceRef.current.rotation + 1) % 4);

    if (!livePiece) {
      return "ignored" as const;
    }

    const pieceWidth = getPieceWidth(livePiece, nextRotation);
    const clampedColumn = Math.min(activePieceRef.current.column, livePuzzle.columnCount - pieceWidth);

    if (!canOccupy(
      livePiece,
      nextRotation,
      activePieceRef.current.row,
      clampedColumn,
      livePuzzle,
      lockedPlacementsRef.current,
    )) {
      return "ignored" as const;
    }

    const nextActivePiece = {
      ...activePieceRef.current,
      column: clampedColumn,
      rotation: nextRotation,
    };

    activePieceRef.current = nextActivePiece;
    setActivePiece(nextActivePiece);
    setLastActionLabel(`${livePiece.label} rotated`);

    return "moved" as const;
  }

  function hardDrop() {
    if (stateRef.current !== "playing" || !activePieceRef.current) {
      return "ignored" as const;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const livePiece = livePuzzle.queue[activePieceRef.current.index] ?? null;

    if (!livePiece) {
      return "ignored" as const;
    }

    let nextRow = activePieceRef.current.row;

    while (canOccupy(
      livePiece,
      activePieceRef.current.rotation,
      nextRow + 1,
      activePieceRef.current.column,
      livePuzzle,
      lockedPlacementsRef.current,
    )) {
      nextRow += 1;
    }

    activePieceRef.current = {
      ...activePieceRef.current,
      row: nextRow,
    };
    setActivePiece(activePieceRef.current);

    return lockActivePiece();
  }

  return {
    activeColumn: activePiece?.column ?? 0,
    activePieceId: activePiece?.pieceId ?? null,
    activePieceLabel: activePieceDefinition?.label ?? null,
    activeRotation: activePiece?.rotation ?? 0,
    beginRun,
    boardCells,
    columnCount: puzzle.columnCount,
    currentPuzzleIndex,
    currentPuzzleName: puzzle.name,
    elapsedSeconds,
    filledCellCount,
    hardDrop,
    lastActionLabel,
    misdropCount,
    move,
    nextPieceLabel: nextPieceDefinition?.label ?? null,
    puzzleCount: config.puzzles.length,
    rotate,
    solutionColumn: activePieceDefinition ? activePieceDefinition.solutionAnchorSlot % puzzle.columnCount : -1,
    solutionRotation: activePieceDefinition?.solutionRotation ?? 0,
    state,
    targetCellCount: puzzle.targetSlots.length,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}

function createSpawnPiece(puzzle: PuzzleDefinition, pieceIndex: number): ActivePiece | null {
  const piece = puzzle.queue[pieceIndex];

  if (!piece) {
    return null;
  }

  const initialRotation = 0;
  const pieceWidth = getPieceWidth(piece, initialRotation);
  const initialColumn = Math.max(0, Math.floor((puzzle.columnCount - pieceWidth) / 2));

  return {
    column: initialColumn,
    index: pieceIndex,
    pieceId: piece.id,
    rotation: initialRotation,
    row: 0,
  };
}

function getDropPreviewSlots(
  activePiece: ActivePiece,
  piece: PieceDefinition,
  puzzle: PuzzleDefinition,
  lockedPlacements: LockedPlacement[],
) {
  let nextRow = activePiece.row;

  while (canOccupy(piece, activePiece.rotation, nextRow + 1, activePiece.column, puzzle, lockedPlacements)) {
    nextRow += 1;
  }

  return resolveActiveSlots(piece, activePiece.rotation, nextRow, activePiece.column, puzzle.rowCount, puzzle.columnCount)
    .filter((slot): slot is number => slot !== null);
}
