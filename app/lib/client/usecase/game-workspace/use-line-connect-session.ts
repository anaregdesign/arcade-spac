import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type PairTheme = "amber" | "cyan" | "lime" | "pink" | "violet";
type TapResult = "cleared" | "extended" | "ignored" | "invalid" | "locked" | "stepped-back";

type PairDefinition = {
  id: string;
  label: string;
  solutionSlots: number[];
  sourceSlot: number;
  targetSlot: number;
  theme: PairTheme;
};

type PuzzleDefinition = {
  columnCount: number;
  id: string;
  name: string;
  pairs: PairDefinition[];
  rowCount: number;
};

type DifficultyConfig = {
  puzzles: PuzzleDefinition[];
  timeLimitSeconds: number;
};

export type LineConnectCell = {
  column: number;
  isActiveEndpoint: boolean;
  isCurrentPath: boolean;
  isLockedPath: boolean;
  isSolutionNext: boolean;
  nodeLabel: string | null;
  pairId: string | null;
  row: number;
  slot: number;
  state: "current-path" | "empty" | "endpoint" | "locked-path";
  theme: PairTheme | null;
};

const puzzleLaneTriples: PuzzleDefinition = {
  columnCount: 5,
  id: "lane-triples",
  name: "Lane Triples",
  pairs: [
    { id: "amber", label: "A", solutionSlots: [0, 5, 10, 15, 20], sourceSlot: 0, targetSlot: 20, theme: "amber" },
    { id: "cyan", label: "B", solutionSlots: [2, 7, 12, 17, 22], sourceSlot: 2, targetSlot: 22, theme: "cyan" },
    { id: "violet", label: "C", solutionSlots: [4, 9, 14, 19, 24], sourceSlot: 4, targetSlot: 24, theme: "violet" },
  ],
  rowCount: 5,
};

const puzzleBentChannels: PuzzleDefinition = {
  columnCount: 5,
  id: "bent-channels",
  name: "Bent Channels",
  pairs: [
    { id: "amber", label: "A", solutionSlots: [0, 1, 2, 3, 4, 9, 14], sourceSlot: 0, targetSlot: 14, theme: "amber" },
    { id: "cyan", label: "B", solutionSlots: [10, 15, 20, 21, 22, 23, 24], sourceSlot: 10, targetSlot: 24, theme: "cyan" },
    { id: "lime", label: "C", solutionSlots: [6, 7, 8, 13, 18], sourceSlot: 6, targetSlot: 18, theme: "lime" },
    { id: "pink", label: "D", solutionSlots: [11, 12, 17], sourceSlot: 11, targetSlot: 17, theme: "pink" },
  ],
  rowCount: 5,
};

const puzzleSplitCorners: PuzzleDefinition = {
  columnCount: 5,
  id: "split-corners",
  name: "Split Corners",
  pairs: [
    { id: "amber", label: "A", solutionSlots: [0, 5, 10], sourceSlot: 0, targetSlot: 10, theme: "amber" },
    { id: "cyan", label: "B", solutionSlots: [4, 9, 14, 19, 24], sourceSlot: 4, targetSlot: 24, theme: "cyan" },
    { id: "lime", label: "C", solutionSlots: [20, 21, 22], sourceSlot: 20, targetSlot: 22, theme: "lime" },
    { id: "pink", label: "D", solutionSlots: [2, 7, 12, 17, 18], sourceSlot: 2, targetSlot: 18, theme: "pink" },
    { id: "violet", label: "E", solutionSlots: [6, 11, 16], sourceSlot: 6, targetSlot: 16, theme: "violet" },
  ],
  rowCount: 5,
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    puzzles: [puzzleLaneTriples],
    timeLimitSeconds: 52,
  },
  NORMAL: {
    puzzles: [puzzleLaneTriples, puzzleBentChannels],
    timeLimitSeconds: 64,
  },
  HARD: {
    puzzles: [puzzleLaneTriples, puzzleBentChannels, puzzleSplitCorners],
    timeLimitSeconds: 80,
  },
  EXPERT: {
    puzzles: [puzzleBentChannels, puzzleSplitCorners, puzzleLaneTriples],
    timeLimitSeconds: 92,
  },
};

function isAdjacent(leftSlot: number, rightSlot: number, columnCount: number) {
  const leftRow = Math.floor(leftSlot / columnCount);
  const leftColumn = leftSlot % columnCount;
  const rightRow = Math.floor(rightSlot / columnCount);
  const rightColumn = rightSlot % columnCount;

  return Math.abs(leftRow - rightRow) + Math.abs(leftColumn - rightColumn) === 1;
}

function getPairBySlot(puzzle: PuzzleDefinition, slot: number) {
  return puzzle.pairs.find((pair) => pair.sourceSlot === slot || pair.targetSlot === slot) ?? null;
}

function getInitialPath(puzzle: PuzzleDefinition, activePairIndex: number) {
  return [puzzle.pairs[activePairIndex]?.sourceSlot ?? 0];
}

function buildBoardCells(
  puzzle: PuzzleDefinition,
  currentPath: number[],
  lockedPaths: Record<string, number[]>,
  activePair: PairDefinition | null,
): LineConnectCell[] {
  const currentPathSet = new Set(currentPath);
  const lockedSlotToPairId = new Map<number, string>();

  for (const [pairId, slots] of Object.entries(lockedPaths)) {
    for (const slot of slots) {
      lockedSlotToPairId.set(slot, pairId);
    }
  }

  return Array.from({ length: puzzle.rowCount * puzzle.columnCount }, (_, slot) => {
    const endpointPair = getPairBySlot(puzzle, slot);
    const lockedPairId = lockedSlotToPairId.get(slot) ?? null;
    const lockedPair = lockedPairId ? puzzle.pairs.find((pair) => pair.id === lockedPairId) ?? null : null;
    const isCurrentPath = currentPathSet.has(slot);
    const isLockedPath = lockedPair !== null;
    const isEndpoint = endpointPair !== null;
    const isCurrentEndpoint = currentPath[currentPath.length - 1] === slot;
    const isSolutionNext = activePair?.solutionSlots[currentPath.length] === slot;
    const theme = endpointPair?.theme ?? lockedPair?.theme ?? (isCurrentPath ? activePair?.theme ?? null : null);
    const state = isLockedPath
      ? "locked-path"
      : isCurrentPath
        ? "current-path"
        : isEndpoint
          ? "endpoint"
          : "empty";

    return {
      column: slot % puzzle.columnCount,
      isActiveEndpoint: isCurrentEndpoint,
      isCurrentPath,
      isLockedPath,
      isSolutionNext: Boolean(isSolutionNext),
      nodeLabel: endpointPair?.label ?? null,
      pairId: endpointPair?.id ?? lockedPairId,
      row: Math.floor(slot / puzzle.columnCount),
      slot,
      state,
      theme,
    };
  });
}

export function useLineConnectSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const firstPuzzle = config.puzzles[0];
  const [activePairIndex, setActivePairIndex] = useState(0);
  const [completedPairCount, setCompletedPairCount] = useState(0);
  const [correctionsCount, setCorrectionsCount] = useState(0);
  const [currentPath, setCurrentPath] = useState<number[]>(() => getInitialPath(firstPuzzle, 0));
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActionLabel, setLastActionLabel] = useState("No path yet");
  const [lockedPaths, setLockedPaths] = useState<Record<string, number[]>>({});
  const [state, setState] = useState<SessionState>("idle");

  const activePairIndexRef = useRef(0);
  const completedPairCountRef = useRef(0);
  const correctionsCountRef = useRef(0);
  const currentPathRef = useRef<number[]>(getInitialPath(firstPuzzle, 0));
  const currentPuzzleIndexRef = useRef(0);
  const lockedPathsRef = useRef<Record<string, number[]>>({});
  const stateRef = useRef<SessionState>("idle");
  const timerIntervalRef = useRef<number | null>(null);

  const puzzle = config.puzzles[currentPuzzleIndex] ?? config.puzzles[0];
  const activePair = puzzle?.pairs[activePairIndex] ?? null;
  const boardCells = useMemo(
    () => buildBoardCells(puzzle, currentPath, lockedPaths, activePair),
    [activePair, currentPath, lockedPaths, puzzle],
  );

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

  function resetSession() {
    clearTimer();

    const initialPuzzle = config.puzzles[0];
    const initialPath = getInitialPath(initialPuzzle, 0);

    activePairIndexRef.current = 0;
    completedPairCountRef.current = 0;
    correctionsCountRef.current = 0;
    currentPathRef.current = initialPath;
    currentPuzzleIndexRef.current = 0;
    lockedPathsRef.current = {};
    stateRef.current = "idle";

    setActivePairIndex(0);
    setCompletedPairCount(0);
    setCorrectionsCount(0);
    setCurrentPath(initialPath);
    setCurrentPuzzleIndex(0);
    setElapsedSeconds(0);
    setLastActionLabel("No path yet");
    setLockedPaths({});
    setState("idle");
  }

  function recordCorrection(message: string) {
    correctionsCountRef.current += 1;
    setCorrectionsCount(correctionsCountRef.current);
    setLastActionLabel(message);
  }

  function openPuzzle(puzzleIndex: number) {
    const nextPuzzle = config.puzzles[puzzleIndex] ?? config.puzzles[0];
    const nextPath = getInitialPath(nextPuzzle, 0);

    activePairIndexRef.current = 0;
    currentPathRef.current = nextPath;
    currentPuzzleIndexRef.current = puzzleIndex;
    lockedPathsRef.current = {};

    setActivePairIndex(0);
    setCurrentPath(nextPath);
    setCurrentPuzzleIndex(puzzleIndex);
    setLockedPaths({});
    setLastActionLabel(`${nextPuzzle.name} ready`);
  }

  function beginRun() {
    clearTimer();
    resetSession();
    setStateSafely("playing");
    setLastActionLabel(`${config.puzzles[0]?.name ?? "Puzzle"} ready`);
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

  function undoStep() {
    if (stateRef.current !== "playing") {
      return "ignored" as const;
    }

    if (currentPathRef.current.length <= 1) {
      return "ignored" as const;
    }

    const nextPath = currentPathRef.current.slice(0, -1);

    currentPathRef.current = nextPath;
    setCurrentPath(nextPath);
    setLastActionLabel(`Pair ${activePair?.label ?? "?"} stepped back`);

    return "stepped-back" as const;
  }

  function resetPair() {
    if (stateRef.current !== "playing" || !activePair) {
      return "ignored" as const;
    }

    if (currentPathRef.current.length === 1) {
      return "ignored" as const;
    }

    currentPathRef.current = [activePair.sourceSlot];
    setCurrentPath([activePair.sourceSlot]);
    recordCorrection(`Pair ${activePair.label} reset`);

    return "invalid" as const;
  }

  function resetPuzzle() {
    if (stateRef.current !== "playing") {
      return "ignored" as const;
    }

    openPuzzle(currentPuzzleIndexRef.current);
    recordCorrection(`${config.puzzles[currentPuzzleIndexRef.current]?.name ?? "Puzzle"} reset`);

    return "invalid" as const;
  }

  function tapCell(slot: number): TapResult {
    if (stateRef.current !== "playing" || !activePair) {
      return "ignored";
    }

    const livePuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const liveActivePair = livePuzzle.pairs[activePairIndexRef.current] ?? livePuzzle.pairs[0];
    const liveCurrentPath = currentPathRef.current;
    const currentEndpoint = liveCurrentPath[liveCurrentPath.length - 1];
    const previousSlot = liveCurrentPath.length > 1 ? liveCurrentPath[liveCurrentPath.length - 2] : null;

    if (slot === currentEndpoint) {
      return "ignored";
    }

    if (slot === previousSlot) {
      return undoStep();
    }

    if (!isAdjacent(currentEndpoint, slot, livePuzzle.columnCount)) {
      recordCorrection("Use adjacent cells only");
      return "invalid";
    }

    if (liveCurrentPath.includes(slot)) {
      recordCorrection("Loops need a reset");
      return "invalid";
    }

    const lockedOwner = Object.entries(lockedPathsRef.current).find(([, slots]) => slots.includes(slot))?.[0] ?? null;

    if (lockedOwner) {
      recordCorrection("Locked paths cannot be crossed");
      return "invalid";
    }

    const pairBySlot = getPairBySlot(livePuzzle, slot);

    if (pairBySlot && pairBySlot.id !== liveActivePair.id) {
      recordCorrection("Another pair node blocks that segment");
      return "invalid";
    }

    const nextPath = [...liveCurrentPath, slot];

    if (slot !== liveActivePair.targetSlot) {
      currentPathRef.current = nextPath;
      setCurrentPath(nextPath);
      setLastActionLabel(`Pair ${liveActivePair.label} extended`);
      return "extended";
    }

    const nextLockedPaths = {
      ...lockedPathsRef.current,
      [liveActivePair.id]: nextPath,
    };
    const nextCompletedPairCount = completedPairCountRef.current + 1;

    completedPairCountRef.current = nextCompletedPairCount;
    lockedPathsRef.current = nextLockedPaths;

    setCompletedPairCount(nextCompletedPairCount);
    setLockedPaths(nextLockedPaths);
    setLastActionLabel(`Pair ${liveActivePair.label} locked`);

    if (activePairIndexRef.current < livePuzzle.pairs.length - 1) {
      const nextPairIndex = activePairIndexRef.current + 1;
      const nextPair = livePuzzle.pairs[nextPairIndex] ?? livePuzzle.pairs[0];
      const nextPathForPair = [nextPair.sourceSlot];

      activePairIndexRef.current = nextPairIndex;
      currentPathRef.current = nextPathForPair;

      setActivePairIndex(nextPairIndex);
      setCurrentPath(nextPathForPair);

      return "locked";
    }

    if (currentPuzzleIndexRef.current < config.puzzles.length - 1) {
      openPuzzle(currentPuzzleIndexRef.current + 1);
      return "locked";
    }

    clearTimer();
    currentPathRef.current = nextPath;
    setCurrentPath(nextPath);
    setStateSafely("cleared");

    return "cleared";
  }

  return {
    activePairLabel: activePair?.label ?? "A",
    beginRun,
    boardCells,
    columnCount: puzzle.columnCount,
    completedPairCount,
    correctionsCount,
    currentPuzzleIndex,
    currentPuzzleName: puzzle.name,
    elapsedSeconds,
    lastActionLabel,
    lockedPairCount: Object.keys(lockedPaths).length,
    pairCount: puzzle.pairs.length,
    pairTokens: puzzle.pairs.map((pair, pairIndex) => ({
      id: pair.id,
      isActive: pairIndex === activePairIndex,
      isCompleted: Boolean(lockedPaths[pair.id]),
      label: pair.label,
      theme: pair.theme,
    })),
    puzzleCount: config.puzzles.length,
    resetPair,
    resetPuzzle,
    rowCount: puzzle.rowCount,
    solutionNextSlot: activePair?.solutionSlots[currentPath.length] ?? -1,
    state,
    tapCell,
    timeLimitSeconds: config.timeLimitSeconds,
    undoStep,
  };
}
