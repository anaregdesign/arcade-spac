import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import type { GridPoint } from "./game-utils";
import { randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "inputting" | "cleared" | "failed";

type DifficultyConfig = {
  columnCount: number;
  flashDurationMs: number;
  flashGapMs: number;
  pathLength: number;
  rowCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, flashDurationMs: 540, flashGapMs: 220, pathLength: 4, rowCount: 3, timeLimitSeconds: 36 },
  NORMAL: { columnCount: 3, flashDurationMs: 500, flashGapMs: 210, pathLength: 5, rowCount: 3, timeLimitSeconds: 48 },
  HARD: { columnCount: 4, flashDurationMs: 440, flashGapMs: 180, pathLength: 6, rowCount: 4, timeLimitSeconds: 60 },
  EXPERT: { columnCount: 4, flashDurationMs: 380, flashGapMs: 160, pathLength: 7, rowCount: 4, timeLimitSeconds: 74 },
};

function buildPath(rowCount: number, columnCount: number, pathLength: number): GridPoint[] {
  while (true) {
    const path: GridPoint[] = [{
      rowIndex: randomInt(rowCount),
      columnIndex: randomInt(columnCount),
    }];

    while (path.length < pathLength) {
      const current = path[path.length - 1];
      const candidates = [
        { rowIndex: current.rowIndex - 1, columnIndex: current.columnIndex },
        { rowIndex: current.rowIndex + 1, columnIndex: current.columnIndex },
        { rowIndex: current.rowIndex, columnIndex: current.columnIndex - 1 },
        { rowIndex: current.rowIndex, columnIndex: current.columnIndex + 1 },
      ].filter((candidate) =>
        candidate.rowIndex >= 0
        && candidate.rowIndex < rowCount
        && candidate.columnIndex >= 0
        && candidate.columnIndex < columnCount
        && !path.some((step) => step.rowIndex === candidate.rowIndex && step.columnIndex === candidate.columnIndex),
      );

      if (candidates.length === 0) {
        break;
      }

      path.push(candidates[randomInt(candidates.length)]);
    }

    if (path.length === pathLength) {
      return path;
    }
  }
}

export function usePathRecallSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [flashingStepIndex, setFlashingStepIndex] = useState<number | null>(null);
  const [inputStep, setInputStep] = useState(0);
  const [path, setPath] = useState<GridPoint[]>([]);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongCellCount, setWrongCellCount] = useState(0);

  const timeoutHandlesRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      for (const handle of timeoutHandlesRef.current) {
        clearBrowserTimeout(handle);
      }

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    for (const handle of timeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    timeoutHandlesRef.current = [];

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setElapsedSeconds(0);
    setFlashingStepIndex(null);
    setInputStep(0);
    setPath([]);
    setState("idle");
    setWrongCellCount(0);
  }, [config]);

  useEffect(() => {
    if (state !== "watching" && state !== "inputting") {
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
          setState((currentState) =>
            currentState === "watching" || currentState === "inputting" ? "failed" : currentState,
          );
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

  function playWatchPhase(nextPath: GridPoint[]) {
    for (const handle of timeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    timeoutHandlesRef.current = [];

    const stepDuration = config.flashDurationMs + config.flashGapMs;

    for (let index = 0; index < nextPath.length; index += 1) {
      const onHandle = startBrowserTimeout(() => {
        setFlashingStepIndex(index);
      }, index * stepDuration);
      const offHandle = startBrowserTimeout(() => {
        setFlashingStepIndex(null);
      }, index * stepDuration + config.flashDurationMs);

      if (onHandle !== null) {
        timeoutHandlesRef.current.push(onHandle);
      }

      if (offHandle !== null) {
        timeoutHandlesRef.current.push(offHandle);
      }
    }

    const finishHandle = startBrowserTimeout(() => {
      setFlashingStepIndex(null);
      setState((current) => (current === "watching" ? "inputting" : current));
    }, nextPath.length * stepDuration);

    if (finishHandle !== null) {
      timeoutHandlesRef.current.push(finishHandle);
    }
  }

  function beginRun() {
    const nextPath = buildPath(config.rowCount, config.columnCount, config.pathLength);

    setElapsedSeconds(0);
    setFlashingStepIndex(null);
    setInputStep(0);
    setPath(nextPath);
    setState("watching");
    setWrongCellCount(0);
    playWatchPhase(nextPath);
  }

  function tapCell(rowIndex: number, columnIndex: number) {
    if (state !== "inputting") {
      return "ignored";
    }

    const expected = path[inputStep];

    if (!expected || expected.rowIndex !== rowIndex || expected.columnIndex !== columnIndex) {
      setWrongCellCount((current) => current + 1);
      return "wrong";
    }

    const nextInputStep = inputStep + 1;

    if (nextInputStep >= path.length) {
      setState("cleared");
      return "correct";
    }

    setInputStep(nextInputStep);
    return "correct";
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    flashingStepIndex,
    inputStep,
    path,
    rowCount: config.rowCount,
    state,
    tapCell,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongCellCount,
  };
}
