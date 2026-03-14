import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import { pickDistinctIndices, randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type CellKind = "empty" | "hazard" | "safe";

export type TapSafeCell = {
  badge: string;
  glyph: string;
  id: string;
  isCleared: boolean;
  kind: CellKind;
};

type DifficultyConfig = {
  columnCount: number;
  hazardCount: number;
  rowCount: number;
  safeCount: number;
  targetSafeHits: number;
  timeLimitSeconds: number;
  waveDurationMs: number;
};

type Marker = Pick<TapSafeCell, "badge" | "glyph">;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 4, hazardCount: 4, rowCount: 4, safeCount: 3, targetSafeHits: 10, timeLimitSeconds: 34, waveDurationMs: 1500 },
  NORMAL: { columnCount: 5, hazardCount: 5, rowCount: 4, safeCount: 4, targetSafeHits: 16, timeLimitSeconds: 46, waveDurationMs: 1250 },
  HARD: { columnCount: 5, hazardCount: 7, rowCount: 5, safeCount: 5, targetSafeHits: 22, timeLimitSeconds: 60, waveDurationMs: 1050 },
  EXPERT: { columnCount: 6, hazardCount: 9, rowCount: 5, safeCount: 6, targetSafeHits: 28, timeLimitSeconds: 74, waveDurationMs: 900 },
};

const safeMarkers: Marker[] = [
  { badge: "SAFE", glyph: "◎" },
  { badge: "OK", glyph: "◉" },
  { badge: "GO", glyph: "✦" },
];

const hazardMarkers: Marker[] = [
  { badge: "HAZ", glyph: "▲" },
  { badge: "NO", glyph: "✕" },
  { badge: "RISK", glyph: "◆" },
];

function buildWave(config: DifficultyConfig, waveIndex: number, preview = false) {
  const totalCellCount = config.rowCount * config.columnCount;
  const nonEmptyCount = config.safeCount + config.hazardCount;
  const pickedIndices = preview
    ? Array.from({ length: nonEmptyCount }, (_, index) => (index * 3 + 1) % totalCellCount)
    : pickDistinctIndices(totalCellCount, nonEmptyCount);
  const safeIndexSet = new Set(pickedIndices.slice(0, config.safeCount));
  const hazardIndexSet = new Set(pickedIndices.slice(config.safeCount));

  return Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const flatIndex = rowIndex * config.columnCount + columnIndex;

      if (safeIndexSet.has(flatIndex)) {
        const marker = preview
          ? safeMarkers[(flatIndex + rowIndex) % safeMarkers.length]
          : safeMarkers[randomInt(safeMarkers.length)];

        return {
          ...marker,
          id: `tap-safe-safe-${waveIndex}-${rowIndex}-${columnIndex}`,
          isCleared: false,
          kind: "safe" as const,
        };
      }

      if (hazardIndexSet.has(flatIndex)) {
        const marker = preview
          ? hazardMarkers[(flatIndex + columnIndex) % hazardMarkers.length]
          : hazardMarkers[randomInt(hazardMarkers.length)];

        return {
          ...marker,
          id: `tap-safe-hazard-${waveIndex}-${rowIndex}-${columnIndex}`,
          isCleared: false,
          kind: "hazard" as const,
        };
      }

      return {
        badge: "",
        glyph: "",
        id: `tap-safe-empty-${waveIndex}-${rowIndex}-${columnIndex}`,
        isCleared: false,
        kind: "empty" as const,
      };
    }),
  );
}

function cloneBoard(board: TapSafeCell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function countRemainingSafe(board: TapSafeCell[][]) {
  return board.flat().filter((cell) => cell.kind === "safe" && !cell.isCleared).length;
}

export function useTapSafeSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewBoard = useMemo(() => buildWave(config, 0, true), [config]);
  const [board, setBoard] = useState<TapSafeCell[][]>(previewBoard);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hazardTapCount, setHazardTapCount] = useState(0);
  const [missedSafeCount, setMissedSafeCount] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [safeHitCount, setSafeHitCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [waveIndex, setWaveIndex] = useState(0);

  const boardRef = useRef<TapSafeCell[][]>(previewBoard);
  const safeHitCountRef = useRef(0);
  const stateRef = useRef<SessionState>("idle");
  const timerIntervalRef = useRef<number | null>(null);
  const waveIndexRef = useRef(0);
  const waveTimeoutRef = useRef<number | null>(null);

  function clearWaveTimeout() {
    if (waveTimeoutRef.current !== null) {
      clearBrowserTimeout(waveTimeoutRef.current);
      waveTimeoutRef.current = null;
    }
  }

  function applyBoard(nextBoard: TapSafeCell[][]) {
    boardRef.current = nextBoard;
    setBoard(nextBoard);
  }

  function resetSession() {
    clearWaveTimeout();

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    boardRef.current = previewBoard;
    safeHitCountRef.current = 0;
    stateRef.current = "idle";
    waveIndexRef.current = 0;

    setBoard(previewBoard);
    setElapsedSeconds(0);
    setHazardTapCount(0);
    setMissedSafeCount(0);
    setPenaltyCount(0);
    setSafeHitCount(0);
    setState("idle");
    setWaveIndex(0);
  }

  function openWave(nextWaveIndex: number) {
    const nextBoard = buildWave(config, nextWaveIndex);

    clearWaveTimeout();
    waveIndexRef.current = nextWaveIndex;
    setWaveIndex(nextWaveIndex);
    applyBoard(nextBoard);

    const timeout = startBrowserTimeout(() => {
      if (stateRef.current !== "playing") {
        return;
      }

      const missedThisWave = countRemainingSafe(boardRef.current);

      if (missedThisWave > 0) {
        setMissedSafeCount((current) => current + missedThisWave);
        setPenaltyCount((current) => current + missedThisWave);
      }

      if (safeHitCountRef.current >= config.targetSafeHits) {
        clearWaveTimeout();
        stateRef.current = "cleared";
        setState("cleared");
        return;
      }

      openWave(nextWaveIndex + 1);
    }, config.waveDurationMs);

    waveTimeoutRef.current = timeout;
  }

  useEffect(() => {
    return () => {
      clearWaveTimeout();

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config, previewBoard]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (state !== "playing") {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          clearWaveTimeout();
          stateRef.current = "failed";
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    safeHitCountRef.current = 0;
    stateRef.current = "playing";
    setElapsedSeconds(0);
    setHazardTapCount(0);
    setMissedSafeCount(0);
    setPenaltyCount(0);
    setSafeHitCount(0);
    setState("playing");
    openWave(0);
  }

  function tapCell(rowIndex: number, columnIndex: number) {
    if (stateRef.current !== "playing") {
      return "ignored" as const;
    }

    const currentCell = boardRef.current[rowIndex]?.[columnIndex];

    if (!currentCell || currentCell.kind === "empty" || currentCell.isCleared) {
      return "ignored" as const;
    }

    const nextBoard = cloneBoard(boardRef.current);
    nextBoard[rowIndex][columnIndex].isCleared = true;
    applyBoard(nextBoard);

    if (currentCell.kind === "hazard") {
      setHazardTapCount((current) => current + 1);
      setPenaltyCount((current) => current + 2);
      return "hazard" as const;
    }

    const nextSafeHitCount = safeHitCountRef.current + 1;

    safeHitCountRef.current = nextSafeHitCount;
    setSafeHitCount(nextSafeHitCount);

    if (nextSafeHitCount >= config.targetSafeHits) {
      clearWaveTimeout();
      stateRef.current = "cleared";
      setState("cleared");
      return "safe" as const;
    }

    if (countRemainingSafe(nextBoard) === 0) {
      openWave(waveIndexRef.current + 1);
    }

    return "safe" as const;
  }

  const attemptCount = safeHitCount + hazardTapCount + missedSafeCount;
  const accuracyPercent = attemptCount === 0 ? 100 : Math.round((safeHitCount / attemptCount) * 100);

  return {
    accuracyPercent,
    beginRun,
    board,
    columnCount: config.columnCount,
    elapsedSeconds,
    hazardTapCount,
    missedSafeCount,
    penaltyCount,
    safeHitCount,
    state,
    targetSafeHits: config.targetSafeHits,
    tapCell,
    timeLimitSeconds: config.timeLimitSeconds,
    waveDurationMs: config.waveDurationMs,
    waveIndex,
  };
}
