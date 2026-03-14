import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type PieceTheme = "amber" | "cyan" | "lime" | "pink" | "violet";
type PlacementResult = "cleared" | "ignored" | "invalid" | "placed";

type CellPoint = {
  column: number;
  row: number;
};

type PieceShape = "bar-3" | "elbow-3" | "l-block" | "square-4" | "tee-4";

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
  pieces: PieceDefinition[];
  rowCount: number;
  targetSlots: number[];
};

type DifficultyConfig = {
  puzzles: PuzzleDefinition[];
  timeLimitSeconds: number;
};

type PlacedPiece = {
  anchorSlot: number;
  pieceId: string;
  rotation: number;
  slots: number[];
};

export type BoxFillBoardCell = {
  column: number;
  occupantLabel: string | null;
  pairTheme: PieceTheme | null;
  row: number;
  slot: number;
  state: "filled" | "invalid-preview" | "preview" | "target-empty" | "void";
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
  "tee-4": [
    { column: 0, row: 0 },
    { column: 1, row: 0 },
    { column: 2, row: 0 },
    { column: 1, row: 1 },
  ],
};

const rawPuzzles = [
  {
    columnCount: 5,
    id: "harbor-crate",
    name: "Harbor Crate",
    pieces: [
      { id: "piece-amber-bar", label: "A", shape: "bar-3", solutionAnchorSlot: 0, solutionRotation: 0, theme: "amber" },
      { id: "piece-cyan-elbow", label: "B", shape: "elbow-3", solutionAnchorSlot: 5, solutionRotation: 1, theme: "cyan" },
      { id: "piece-lime-square", label: "C", shape: "square-4", solutionAnchorSlot: 12, solutionRotation: 0, theme: "lime" },
      { id: "piece-pink-tee", label: "D", shape: "tee-4", solutionAnchorSlot: 3, solutionRotation: 1, theme: "pink" },
    ],
    rowCount: 5,
  },
  {
    columnCount: 5,
    id: "gallery-stack",
    name: "Gallery Stack",
    pieces: [
      { id: "piece-amber-l", label: "A", shape: "l-block", solutionAnchorSlot: 1, solutionRotation: 1, theme: "amber" },
      { id: "piece-cyan-bar", label: "B", shape: "bar-3", solutionAnchorSlot: 10, solutionRotation: 1, theme: "cyan" },
      { id: "piece-lime-square", label: "C", shape: "square-4", solutionAnchorSlot: 12, solutionRotation: 0, theme: "lime" },
      { id: "piece-violet-elbow", label: "D", shape: "elbow-3", solutionAnchorSlot: 16, solutionRotation: 0, theme: "violet" },
    ],
    rowCount: 5,
  },
] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    puzzles: [hydratePuzzle(rawPuzzles[0])],
    timeLimitSeconds: 56,
  },
  NORMAL: {
    puzzles: [hydratePuzzle(rawPuzzles[0]), hydratePuzzle(rawPuzzles[1])],
    timeLimitSeconds: 70,
  },
  HARD: {
    puzzles: [hydratePuzzle(rawPuzzles[0]), hydratePuzzle(rawPuzzles[1]), hydratePuzzle(rawPuzzles[0])],
    timeLimitSeconds: 86,
  },
  EXPERT: {
    puzzles: [hydratePuzzle(rawPuzzles[1]), hydratePuzzle(rawPuzzles[0]), hydratePuzzle(rawPuzzles[1])],
    timeLimitSeconds: 98,
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

function resolvePlacementSlots(
  piece: PieceDefinition,
  rotation: number,
  anchorSlot: number,
  rowCount: number,
  columnCount: number,
) {
  const anchorRow = Math.floor(anchorSlot / columnCount);
  const anchorColumn = anchorSlot % columnCount;
  const rotatedCells = rotateCells(piece.baseCells, rotation);

  return rotatedCells.map((cell) => {
    const row = anchorRow + cell.row;
    const column = anchorColumn + cell.column;

    if (row < 0 || column < 0 || row >= rowCount || column >= columnCount) {
      return null;
    }

    return toSlot(row, column, columnCount);
  });
}

function hydratePuzzle(rawPuzzle: (typeof rawPuzzles)[number]): PuzzleDefinition {
  const pieces = rawPuzzle.pieces.map((piece) => ({
    ...piece,
    baseCells: normalizeCells(baseCellsByShape[piece.shape]),
    cellCount: baseCellsByShape[piece.shape].length,
  }));
  const targetSlots = Array.from(new Set(
    pieces.flatMap((piece) =>
      resolvePlacementSlots(piece, piece.solutionRotation, piece.solutionAnchorSlot, rawPuzzle.rowCount, rawPuzzle.columnCount)
        .filter((slot): slot is number => slot !== null),
    ),
  )).sort((left, right) => left - right);

  return {
    columnCount: rawPuzzle.columnCount,
    id: rawPuzzle.id,
    name: rawPuzzle.name,
    pieces,
    rowCount: rawPuzzle.rowCount,
    targetSlots,
  };
}

function buildTargetCellMap(puzzle: PuzzleDefinition, placedPieces: Record<string, PlacedPiece>, previewSlots: number[], previewValid: boolean) {
  const targetSlotSet = new Set(puzzle.targetSlots);
  const occupiedSlotMap = new Map<number, PlacedPiece>();

  for (const placement of Object.values(placedPieces)) {
    for (const slot of placement.slots) {
      occupiedSlotMap.set(slot, placement);
    }
  }

  const previewSlotSet = new Set(previewSlots);

  return Array.from({ length: puzzle.rowCount * puzzle.columnCount }, (_, slot): BoxFillBoardCell => {
    const occupant = occupiedSlotMap.get(slot) ?? null;
    const isTarget = targetSlotSet.has(slot);
    const isPreview = previewSlotSet.has(slot) && occupant === null;

    return {
      column: slot % puzzle.columnCount,
      occupantLabel: occupant
        ? puzzle.pieces.find((piece) => piece.id === occupant.pieceId)?.label ?? null
        : null,
      pairTheme: occupant
        ? puzzle.pieces.find((piece) => piece.id === occupant.pieceId)?.theme ?? null
        : null,
      row: Math.floor(slot / puzzle.columnCount),
      slot,
      state: occupant
        ? "filled"
        : isPreview
          ? previewValid
            ? "preview"
            : "invalid-preview"
          : isTarget
            ? "target-empty"
            : "void",
    };
  });
}

function findFirstUnplacedPiece(puzzle: PuzzleDefinition, placedPieces: Record<string, PlacedPiece>) {
  return puzzle.pieces.find((piece) => !placedPieces[piece.id]) ?? null;
}

export function useBoxFillSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActionLabel, setLastActionLabel] = useState("No piece placed");
  const [placedPieces, setPlacedPieces] = useState<Record<string, PlacedPiece>>({});
  const [placementErrors, setPlacementErrors] = useState(0);
  const [, setPlacementHistory] = useState<string[]>([]);
  const [previewAnchorSlot, setPreviewAnchorSlot] = useState<number | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedRotation, setSelectedRotation] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  const currentPuzzleIndexRef = useRef(0);
  const placedPiecesRef = useRef<Record<string, PlacedPiece>>({});
  const placementErrorsRef = useRef(0);
  const placementHistoryRef = useRef<string[]>([]);
  const previewAnchorSlotRef = useRef<number | null>(null);
  const selectedPieceIdRef = useRef<string | null>(null);
  const selectedRotationRef = useRef(0);
  const stateRef = useRef<SessionState>("idle");
  const timerIntervalRef = useRef<number | null>(null);

  const puzzle = config.puzzles[currentPuzzleIndex] ?? config.puzzles[0];
  const selectedPiece = puzzle.pieces.find((piece) => piece.id === selectedPieceId) ?? null;
  const rawPreviewSlots = selectedPiece && previewAnchorSlot !== null
    ? resolvePlacementSlots(selectedPiece, selectedRotation, previewAnchorSlot, puzzle.rowCount, puzzle.columnCount)
    : [];
  const previewSlots = rawPreviewSlots.filter((slot): slot is number => slot !== null);
  const previewValid = Boolean(
    selectedPiece
    && previewAnchorSlot !== null
    && rawPreviewSlots.every((slot): slot is number => slot !== null)
    && previewSlots.every((slot) => puzzle.targetSlots.includes(slot))
    && previewSlots.every((slot) => !Object.values(placedPieces).some((placement) => placement.slots.includes(slot))),
  );
  const boardCells = useMemo(
    () => buildTargetCellMap(puzzle, placedPieces, previewSlots, previewValid),
    [placedPieces, previewSlots, previewValid, puzzle],
  );
  const filledCellCount = Object.values(placedPieces).reduce((total, placement) => total + placement.slots.length, 0);
  const remainingCellCount = Math.max(0, puzzle.targetSlots.length - filledCellCount);
  const nextSolutionPiece = findFirstUnplacedPiece(puzzle, placedPieces);

  function clearTimer() {
    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function setStateSafely(nextState: SessionState) {
    stateRef.current = nextState;
    setState(nextState);
  }

  function syncSelectionForPuzzle(
    nextPuzzle: PuzzleDefinition,
    nextPlacedPieces: Record<string, PlacedPiece>,
    nextSelectedPieceId?: string | null,
  ) {
    const fallbackPiece = nextSelectedPieceId
      ? nextPuzzle.pieces.find((piece) => piece.id === nextSelectedPieceId && !nextPlacedPieces[piece.id]) ?? null
      : null;
    const firstUnplaced = fallbackPiece ?? findFirstUnplacedPiece(nextPuzzle, nextPlacedPieces);
    const nextPieceId = firstUnplaced?.id ?? null;

    selectedPieceIdRef.current = nextPieceId;
    selectedRotationRef.current = 0;
    previewAnchorSlotRef.current = null;

    setSelectedPieceId(nextPieceId);
    setSelectedRotation(0);
    setPreviewAnchorSlot(null);
  }

  function resetSession() {
    clearTimer();

    const firstPuzzle = config.puzzles[0];

    currentPuzzleIndexRef.current = 0;
    placedPiecesRef.current = {};
    placementErrorsRef.current = 0;
    placementHistoryRef.current = [];
    stateRef.current = "idle";

    setCurrentPuzzleIndex(0);
    setElapsedSeconds(0);
    setLastActionLabel("No piece placed");
    setPlacedPieces({});
    setPlacementErrors(0);
    setPlacementHistory([]);
    setState("idle");
    syncSelectionForPuzzle(firstPuzzle, {});
  }

  function beginRun() {
    clearTimer();
    currentPuzzleIndexRef.current = 0;
    placedPiecesRef.current = {};
    placementErrorsRef.current = 0;
    placementHistoryRef.current = [];

    setCurrentPuzzleIndex(0);
    setElapsedSeconds(0);
    setLastActionLabel(`${config.puzzles[0]?.name ?? "Board"} ready`);
    setPlacedPieces({});
    setPlacementErrors(0);
    setPlacementHistory([]);
    setStateSafely("playing");
    syncSelectionForPuzzle(config.puzzles[0], {});
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      clearTimer();
      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setStateSafely("failed");
        }

        return next;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [config.timeLimitSeconds, state]);

  function selectPiece(pieceId: string) {
    if (stateRef.current !== "playing") {
      return;
    }

    if (placedPiecesRef.current[pieceId]) {
      return;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const nextPiece = livePuzzle.pieces.find((piece) => piece.id === pieceId) ?? null;

    if (!nextPiece) {
      return;
    }

    selectedPieceIdRef.current = pieceId;
    selectedRotationRef.current = 0;
    previewAnchorSlotRef.current = null;

    setSelectedPieceId(pieceId);
    setSelectedRotation(0);
    setPreviewAnchorSlot(null);
    setLastActionLabel(`Selected ${nextPiece.label}`);
  }

  function rotateSelectedPiece() {
    if (stateRef.current !== "playing" || !selectedPieceIdRef.current) {
      return;
    }

    const nextRotation = (selectedRotationRef.current + 1) % 4;

    selectedRotationRef.current = nextRotation;
    setSelectedRotation(nextRotation);
    setLastActionLabel(`Rotation ${nextRotation * 90}°`);
  }

  function choosePreviewAnchor(slot: number) {
    if (stateRef.current !== "playing" || !selectedPieceIdRef.current) {
      return;
    }

    previewAnchorSlotRef.current = slot;
    setPreviewAnchorSlot(slot);
    setLastActionLabel(`Preview at S${slot + 1}`);
  }

  function placeSelectedPiece(): PlacementResult {
    if (stateRef.current !== "playing" || !selectedPieceIdRef.current) {
      return "ignored";
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const liveSelectedPiece = livePuzzle.pieces.find((piece) => piece.id === selectedPieceIdRef.current) ?? null;
    const livePreviewAnchorSlot = previewAnchorSlotRef.current;

    if (!liveSelectedPiece || livePreviewAnchorSlot === null) {
      return "ignored";
    }

    const candidateRawSlots = resolvePlacementSlots(
      liveSelectedPiece,
      selectedRotationRef.current,
      livePreviewAnchorSlot,
      livePuzzle.rowCount,
      livePuzzle.columnCount,
    );
    const candidateSlots = candidateRawSlots.filter((slot): slot is number => slot !== null);
    const isValid = candidateRawSlots.every((slot): slot is number => slot !== null)
      && candidateSlots.every((slot) => livePuzzle.targetSlots.includes(slot))
      && candidateSlots.every((slot) => !Object.values(placedPiecesRef.current).some((placement) => placement.slots.includes(slot)));

    if (!isValid) {
      placementErrorsRef.current += 1;
      setPlacementErrors(placementErrorsRef.current);
      setLastActionLabel("Placement blocked");
      return "invalid";
    }

    const placement: PlacedPiece = {
      anchorSlot: livePreviewAnchorSlot,
      pieceId: liveSelectedPiece.id,
      rotation: selectedRotationRef.current,
      slots: candidateSlots,
    };
    const nextPlacedPieces = {
      ...placedPiecesRef.current,
      [liveSelectedPiece.id]: placement,
    };
    const nextPlacementHistory = [...placementHistoryRef.current, liveSelectedPiece.id];
    const nextFilledCellCount = Object.values(nextPlacedPieces).reduce((total, nextPlacement) => total + nextPlacement.slots.length, 0);
    const isPuzzleComplete = nextFilledCellCount === livePuzzle.targetSlots.length;

    placedPiecesRef.current = nextPlacedPieces;
    placementHistoryRef.current = nextPlacementHistory;

    setPlacedPieces(nextPlacedPieces);
    setPlacementHistory(nextPlacementHistory);
    setLastActionLabel(`Placed ${liveSelectedPiece.label}`);

    if (isPuzzleComplete) {
      if (currentPuzzleIndexRef.current < config.puzzles.length - 1) {
        const nextPuzzleIndex = currentPuzzleIndexRef.current + 1;
        const nextPuzzle = config.puzzles[nextPuzzleIndex] ?? config.puzzles[0];

        currentPuzzleIndexRef.current = nextPuzzleIndex;
        placedPiecesRef.current = {};
        placementHistoryRef.current = [];

        setCurrentPuzzleIndex(nextPuzzleIndex);
        setPlacedPieces({});
        setPlacementHistory([]);
        setLastActionLabel(`${nextPuzzle.name} ready`);
        syncSelectionForPuzzle(nextPuzzle, {});

        return "placed";
      }

      clearTimer();
      setStateSafely("cleared");
      syncSelectionForPuzzle(livePuzzle, nextPlacedPieces, null);

      return "cleared";
    }

    syncSelectionForPuzzle(livePuzzle, nextPlacedPieces);

    return "placed";
  }

  function undoLastPlacement() {
    if (stateRef.current !== "playing") {
      return;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const lastPieceId = placementHistoryRef.current[placementHistoryRef.current.length - 1];

    if (!lastPieceId) {
      return;
    }

    const removedPlacement = placedPiecesRef.current[lastPieceId];
    const nextPlacedPieces = { ...placedPiecesRef.current };
    const nextPlacementHistory = placementHistoryRef.current.slice(0, -1);

    delete nextPlacedPieces[lastPieceId];

    placedPiecesRef.current = nextPlacedPieces;
    placementHistoryRef.current = nextPlacementHistory;

    setPlacedPieces(nextPlacedPieces);
    setPlacementHistory(nextPlacementHistory);
    setLastActionLabel(`Removed ${livePuzzle.pieces.find((piece) => piece.id === lastPieceId)?.label ?? "piece"}`);
    syncSelectionForPuzzle(livePuzzle, nextPlacedPieces, lastPieceId);

    if (removedPlacement) {
      selectedRotationRef.current = removedPlacement.rotation;
      previewAnchorSlotRef.current = removedPlacement.anchorSlot;
      setSelectedRotation(removedPlacement.rotation);
      setPreviewAnchorSlot(removedPlacement.anchorSlot);
    }
  }

  function resetBoard() {
    if (stateRef.current !== "playing") {
      return;
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];

    placedPiecesRef.current = {};
    placementHistoryRef.current = [];

    setPlacedPieces({});
    setPlacementHistory([]);
    setLastActionLabel(`${livePuzzle.name} reset`);
    syncSelectionForPuzzle(livePuzzle, {});
  }

  return {
    beginRun,
    boardCells,
    choosePreviewAnchor,
    columnCount: puzzle.columnCount,
    currentPuzzleIndex,
    currentPuzzleName: puzzle.name,
    elapsedSeconds,
    filledCellCount,
    lastActionLabel,
    nextSolutionAnchorSlot: nextSolutionPiece?.solutionAnchorSlot ?? -1,
    nextSolutionPieceId: nextSolutionPiece?.id ?? null,
    nextSolutionRotation: nextSolutionPiece?.solutionRotation ?? 0,
    pieceCount: puzzle.pieces.length,
    pieces: puzzle.pieces.map((piece) => ({
      cellCount: piece.cellCount,
      id: piece.id,
      isPlaced: Boolean(placedPieces[piece.id]),
      label: piece.label,
      theme: piece.theme,
    })),
    placementErrors,
    placeSelectedPiece,
    previewAnchorSlot,
    previewValid,
    puzzleCount: config.puzzles.length,
    remainingCellCount,
    resetBoard,
    rowCount: puzzle.rowCount,
    rotateSelectedPiece,
    selectedPieceId,
    selectedRotation,
    selectPiece,
    state,
    targetCellCount: puzzle.targetSlots.length,
    timeLimitSeconds: config.timeLimitSeconds,
    undoLastPlacement,
  };
}
