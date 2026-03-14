import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type ZoneTone = "amber" | "mint" | "plum" | "rose" | "sky" | "slate";

type ZoneCell = {
  columnIndex: number;
  rowIndex: number;
};

type ZoneTemplate = {
  cells: ZoneCell[];
  id: string;
  label: string;
  tone: ZoneTone;
};

type ZonePuzzle = {
  columnCount: number;
  rowCount: number;
  solution: boolean[][];
  zones: Array<ZoneTemplate & { targetCount: number }>;
};

type DifficultyConfig = {
  roundCount: number;
  timeLimitSeconds: number;
};

type PuzzleBlueprint = {
  mirror: boolean;
  rotationTurns: number;
  size: 3 | 4;
  solutionPattern: string;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { roundCount: 3, timeLimitSeconds: 42 },
  NORMAL: { roundCount: 4, timeLimitSeconds: 56 },
  HARD: { roundCount: 4, timeLimitSeconds: 70 },
  EXPERT: { roundCount: 5, timeLimitSeconds: 82 },
};

const zoneTemplatesBySize: Record<3 | 4, ZoneTemplate[]> = {
  3: [
    {
      cells: [
        { columnIndex: 0, rowIndex: 0 },
        { columnIndex: 1, rowIndex: 0 },
        { columnIndex: 0, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 1 },
      ],
      id: "northwest",
      label: "Northwest block",
      tone: "amber",
    },
    {
      cells: [
        { columnIndex: 1, rowIndex: 0 },
        { columnIndex: 2, rowIndex: 0 },
        { columnIndex: 1, rowIndex: 1 },
        { columnIndex: 2, rowIndex: 1 },
      ],
      id: "northeast",
      label: "Northeast block",
      tone: "sky",
    },
    {
      cells: [
        { columnIndex: 0, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 1 },
        { columnIndex: 0, rowIndex: 2 },
        { columnIndex: 1, rowIndex: 2 },
      ],
      id: "southwest",
      label: "Southwest block",
      tone: "mint",
    },
    {
      cells: [
        { columnIndex: 1, rowIndex: 1 },
        { columnIndex: 2, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 2 },
        { columnIndex: 2, rowIndex: 2 },
      ],
      id: "southeast",
      label: "Southeast block",
      tone: "rose",
    },
    {
      cells: [
        { columnIndex: 0, rowIndex: 0 },
        { columnIndex: 2, rowIndex: 0 },
        { columnIndex: 0, rowIndex: 2 },
        { columnIndex: 2, rowIndex: 2 },
      ],
      id: "corners",
      label: "Corner ring",
      tone: "plum",
    },
    {
      cells: [
        { columnIndex: 1, rowIndex: 0 },
        { columnIndex: 0, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 1 },
        { columnIndex: 2, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 2 },
      ],
      id: "cross",
      label: "Center cross",
      tone: "slate",
    },
  ],
  4: [
    {
      cells: [
        { columnIndex: 0, rowIndex: 0 },
        { columnIndex: 1, rowIndex: 0 },
        { columnIndex: 0, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 1 },
      ],
      id: "northwest",
      label: "Northwest block",
      tone: "amber",
    },
    {
      cells: [
        { columnIndex: 2, rowIndex: 0 },
        { columnIndex: 3, rowIndex: 0 },
        { columnIndex: 2, rowIndex: 1 },
        { columnIndex: 3, rowIndex: 1 },
      ],
      id: "northeast",
      label: "Northeast block",
      tone: "sky",
    },
    {
      cells: [
        { columnIndex: 0, rowIndex: 2 },
        { columnIndex: 1, rowIndex: 2 },
        { columnIndex: 0, rowIndex: 3 },
        { columnIndex: 1, rowIndex: 3 },
      ],
      id: "southwest",
      label: "Southwest block",
      tone: "mint",
    },
    {
      cells: [
        { columnIndex: 2, rowIndex: 2 },
        { columnIndex: 3, rowIndex: 2 },
        { columnIndex: 2, rowIndex: 3 },
        { columnIndex: 3, rowIndex: 3 },
      ],
      id: "southeast",
      label: "Southeast block",
      tone: "rose",
    },
    {
      cells: [
        { columnIndex: 0, rowIndex: 0 },
        { columnIndex: 1, rowIndex: 0 },
        { columnIndex: 2, rowIndex: 0 },
        { columnIndex: 3, rowIndex: 0 },
        { columnIndex: 0, rowIndex: 1 },
        { columnIndex: 3, rowIndex: 1 },
        { columnIndex: 0, rowIndex: 2 },
        { columnIndex: 3, rowIndex: 2 },
        { columnIndex: 0, rowIndex: 3 },
        { columnIndex: 1, rowIndex: 3 },
        { columnIndex: 2, rowIndex: 3 },
        { columnIndex: 3, rowIndex: 3 },
      ],
      id: "frame",
      label: "Outer frame",
      tone: "plum",
    },
    {
      cells: [
        { columnIndex: 0, rowIndex: 0 },
        { columnIndex: 3, rowIndex: 0 },
        { columnIndex: 1, rowIndex: 1 },
        { columnIndex: 2, rowIndex: 1 },
        { columnIndex: 1, rowIndex: 2 },
        { columnIndex: 2, rowIndex: 2 },
        { columnIndex: 0, rowIndex: 3 },
        { columnIndex: 3, rowIndex: 3 },
      ],
      id: "weave",
      label: "Diagonal weave",
      tone: "slate",
    },
  ],
};

const difficultyBlueprints: Record<Difficulty, PuzzleBlueprint[]> = {
  EASY: [
    { mirror: false, rotationTurns: 0, size: 3, solutionPattern: "101/010/100" },
    { mirror: true, rotationTurns: 1, size: 3, solutionPattern: "010/110/100" },
    { mirror: false, rotationTurns: 2, size: 3, solutionPattern: "101/110/100" },
  ],
  NORMAL: [
    { mirror: false, rotationTurns: 1, size: 3, solutionPattern: "101/010/100" },
    { mirror: true, rotationTurns: 2, size: 3, solutionPattern: "010/110/100" },
    { mirror: false, rotationTurns: 3, size: 3, solutionPattern: "100/110/010" },
    { mirror: true, rotationTurns: 0, size: 3, solutionPattern: "101/110/100" },
  ],
  HARD: [
    { mirror: false, rotationTurns: 0, size: 4, solutionPattern: "1001/0110/0100/1000" },
    { mirror: true, rotationTurns: 1, size: 4, solutionPattern: "0011/0110/0100/1000" },
    { mirror: false, rotationTurns: 2, size: 4, solutionPattern: "1101/1000/0100/1000" },
    { mirror: true, rotationTurns: 3, size: 4, solutionPattern: "1100/1100/0100/1000" },
  ],
  EXPERT: [
    { mirror: false, rotationTurns: 1, size: 4, solutionPattern: "1001/0110/0100/1000" },
    { mirror: true, rotationTurns: 2, size: 4, solutionPattern: "0011/0110/0100/1000" },
    { mirror: false, rotationTurns: 3, size: 4, solutionPattern: "1101/1000/0100/1000" },
    { mirror: true, rotationTurns: 0, size: 4, solutionPattern: "1100/1100/0100/1000" },
    { mirror: false, rotationTurns: 2, size: 4, solutionPattern: "0001/0110/0110/1000" },
  ],
};

function parseSolutionPattern(pattern: string) {
  return pattern.split("/").map((row) => row.split("").map((cell) => cell === "1"));
}

function cloneBoard(board: boolean[][]) {
  return board.map((row) => [...row]);
}

function createEmptyBoard(rowCount: number, columnCount: number) {
  return Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, () => false));
}

function sortCells(cells: ZoneCell[]) {
  return [...cells].sort((left, right) => left.rowIndex - right.rowIndex || left.columnIndex - right.columnIndex);
}

function transformCell(cell: ZoneCell, size: number, rotationTurns: number, mirror: boolean): ZoneCell {
  let rowIndex = cell.rowIndex;
  let columnIndex = mirror ? size - 1 - cell.columnIndex : cell.columnIndex;

  for (let turn = 0; turn < rotationTurns; turn += 1) {
    const nextRowIndex = columnIndex;
    const nextColumnIndex = size - 1 - rowIndex;

    rowIndex = nextRowIndex;
    columnIndex = nextColumnIndex;
  }

  return { columnIndex, rowIndex };
}

function transformBoard(board: boolean[][], rotationTurns: number, mirror: boolean) {
  const rowCount = board.length;
  const columnCount = board[0]?.length ?? 0;
  const next = createEmptyBoard(rowCount, columnCount);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      if (!board[rowIndex]?.[columnIndex]) {
        continue;
      }

      const position = transformCell({ columnIndex, rowIndex }, rowCount, rotationTurns, mirror);
      next[position.rowIndex][position.columnIndex] = true;
    }
  }

  return next;
}

function countActiveCells(board: boolean[][], cells: ZoneCell[]) {
  return cells.reduce((count, cell) => count + (board[cell.rowIndex]?.[cell.columnIndex] ? 1 : 0), 0);
}

function isBoardEmpty(board: boolean[][]) {
  return board.every((row) => row.every((cell) => !cell));
}

function countLockedZones(puzzle: ZonePuzzle, board: boolean[][]) {
  return puzzle.zones.reduce((count, zone) => count + (countActiveCells(board, zone.cells) === zone.targetCount ? 1 : 0), 0);
}

function buildPuzzle(blueprint: PuzzleBlueprint): ZonePuzzle {
  const solution = transformBoard(parseSolutionPattern(blueprint.solutionPattern), blueprint.rotationTurns, blueprint.mirror);
  const zones = zoneTemplatesBySize[blueprint.size].map((zone) => {
    const cells = sortCells(zone.cells.map((cell) => transformCell(cell, blueprint.size, blueprint.rotationTurns, blueprint.mirror)));

    return {
      ...zone,
      cells,
      targetCount: countActiveCells(solution, cells),
    };
  });

  return {
    columnCount: blueprint.size,
    rowCount: blueprint.size,
    solution,
    zones,
  };
}

export function useZoneLockSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const puzzles = useMemo(
    () => difficultyBlueprints[difficulty].slice(0, config.roundCount).map((blueprint) => buildPuzzle(blueprint)),
    [config.roundCount, difficulty],
  );
  const previewPuzzle = puzzles[0];

  if (!previewPuzzle) {
    throw new Error(`Missing Zone Lock preview puzzle for ${difficulty}`);
  }

  const [activeBoard, setActiveBoard] = useState<boolean[][]>(createEmptyBoard(previewPuzzle.rowCount, previewPuzzle.columnCount));
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  const timerIntervalRef = useRef<number | null>(null);
  const currentPuzzle = puzzles[currentRoundIndex] ?? previewPuzzle;

  const zones = useMemo(
    () =>
      currentPuzzle.zones.map((zone) => {
        const currentCount = countActiveCells(activeBoard, zone.cells);

        return {
          ...zone,
          currentCount,
          isLocked: currentCount === zone.targetCount,
        };
      }),
    [activeBoard, currentPuzzle],
  );
  const lockedZoneCount = useMemo(
    () => zones.reduce((count, zone) => count + (zone.isLocked ? 1 : 0), 0),
    [zones],
  );
  const totalZoneCount = useMemo(
    () => puzzles.reduce((count, puzzle) => count + puzzle.zones.length, 0),
    [puzzles],
  );
  const lockedZoneCountBeforeCurrentRound = useMemo(
    () => puzzles.slice(0, currentRoundIndex).reduce((count, puzzle) => count + puzzle.zones.length, 0),
    [currentRoundIndex, puzzles],
  );
  const totalLockedZoneCount =
    state === "cleared" ? totalZoneCount : Math.min(totalZoneCount, lockedZoneCountBeforeCurrentRound + lockedZoneCount);

  function clearTimerInterval() {
    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function resetSession() {
    clearTimerInterval();
    setActiveBoard(createEmptyBoard(previewPuzzle.rowCount, previewPuzzle.columnCount));
    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setResetCount(0);
    setState("idle");
  }

  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [previewPuzzle]);

  useEffect(() => {
    if (state !== "playing") {
      clearTimerInterval();
      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => {
      clearTimerInterval();
    };
  }, [config.timeLimitSeconds, state]);

  function openRound(roundIndex: number) {
    const puzzle = puzzles[roundIndex] ?? previewPuzzle;

    setActiveBoard(createEmptyBoard(puzzle.rowCount, puzzle.columnCount));
    setCurrentRoundIndex(roundIndex);
    setState("playing");
  }

  function beginRun() {
    setElapsedSeconds(0);
    setResetCount(0);
    openRound(0);
  }

  function toggleCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const nextBoard = cloneBoard(activeBoard);

    if (nextBoard[rowIndex]?.[columnIndex] === undefined) {
      return "ignored" as const;
    }

    nextBoard[rowIndex][columnIndex] = !nextBoard[rowIndex][columnIndex];

    const nextLockedZoneCount = countLockedZones(currentPuzzle, nextBoard);

    if (nextLockedZoneCount === currentPuzzle.zones.length) {
      if (currentRoundIndex + 1 >= puzzles.length) {
        setActiveBoard(nextBoard);
        setState("cleared");
        return "solved" as const;
      }

      const nextRoundIndex = currentRoundIndex + 1;
      const nextPuzzle = puzzles[nextRoundIndex] ?? previewPuzzle;

      setActiveBoard(createEmptyBoard(nextPuzzle.rowCount, nextPuzzle.columnCount));
      setCurrentRoundIndex(nextRoundIndex);
      return "round-cleared" as const;
    }

    setActiveBoard(nextBoard);
    return "toggled" as const;
  }

  function resetBoard() {
    if (state !== "playing" || isBoardEmpty(activeBoard)) {
      return "ignored" as const;
    }

    setActiveBoard(createEmptyBoard(currentPuzzle.rowCount, currentPuzzle.columnCount));
    setResetCount((current) => current + 1);
    return "reset" as const;
  }

  return {
    activeBoard,
    beginRun,
    columnCount: currentPuzzle.columnCount,
    currentRoundIndex,
    elapsedSeconds,
    lockedZoneCount,
    puzzles,
    resetBoard,
    resetCount,
    rowCount: currentPuzzle.rowCount,
    roundCount: puzzles.length,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    toggleCell,
    totalLockedZoneCount,
    totalZoneCount,
    zones,
  };
}
