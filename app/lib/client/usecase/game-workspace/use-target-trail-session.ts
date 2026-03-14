import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type TapResult = "correct" | "ignored" | "wrong";

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  targetCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, rowCount: 3, targetCount: 6, timeLimitSeconds: 24 },
  NORMAL: { columnCount: 4, rowCount: 3, targetCount: 8, timeLimitSeconds: 34 },
  HARD: { columnCount: 4, rowCount: 4, targetCount: 10, timeLimitSeconds: 44 },
  EXPERT: { columnCount: 5, rowCount: 4, targetCount: 12, timeLimitSeconds: 58 },
};

function createVisitedState(cellCount: number) {
  return Array.from({ length: cellCount }, () => false);
}

function pickNextTarget(cellCount: number, currentIndex: number | null, visited: boolean[]) {
  const candidates = Array.from({ length: cellCount }, (_, index) => index).filter((index) => !visited[index] && index !== currentIndex);

  if (candidates.length === 0) {
    return currentIndex ?? 0;
  }

  return candidates[randomInt(candidates.length)];
}

export function useTargetTrailSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const cellCount = config.rowCount * config.columnCount;
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [stepCount, setStepCount] = useState(0);
  const [visited, setVisited] = useState<boolean[]>(() => createVisitedState(cellCount));

  useEffect(() => {
    setActiveTargetIndex(0);
    setElapsedSeconds(0);
    setMissCount(0);
    setState("idle");
    setStepCount(0);
    setVisited(createVisitedState(cellCount));
  }, [cellCount, config]);

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
    const nextVisited = createVisitedState(cellCount);
    const nextTarget = pickNextTarget(cellCount, null, nextVisited);

    setActiveTargetIndex(nextTarget);
    setElapsedSeconds(0);
    setMissCount(0);
    setState("playing");
    setStepCount(0);
    setVisited(nextVisited);
  }

  function tapCell(rowIndex: number, columnIndex: number): TapResult {
    if (state !== "playing") {
      return "ignored";
    }

    const tappedIndex = rowIndex * config.columnCount + columnIndex;

    if (tappedIndex !== activeTargetIndex) {
      setMissCount((current) => current + 1);
      return "wrong";
    }

    const nextVisited = [...visited];
    nextVisited[tappedIndex] = true;
    const nextStepCount = stepCount + 1;

    setVisited(nextVisited);
    setStepCount(nextStepCount);

    if (nextStepCount >= config.targetCount) {
      setState("cleared");
      return "correct";
    }

    setActiveTargetIndex(pickNextTarget(cellCount, tappedIndex, nextVisited));
    return "correct";
  }

  return {
    activeTargetIndex,
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    missCount,
    rowCount: config.rowCount,
    state,
    stepCount,
    targetCount: config.targetCount,
    tapCell,
    timeLimitSeconds: config.timeLimitSeconds,
    visited,
  };
}
