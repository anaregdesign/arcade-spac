import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import { randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "inputting" | "cleared" | "failed";

type DifficultyConfig = {
  columnCount: number;
  flashDurationMs: number;
  flashGapMs: number;
  initialSequenceLength: number;
  rowCount: number;
  targetSequenceLength: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 3, flashDurationMs: 360, flashGapMs: 130, initialSequenceLength: 3, rowCount: 3, targetSequenceLength: 6, timeLimitSeconds: 34 },
  NORMAL: { columnCount: 3, flashDurationMs: 320, flashGapMs: 120, initialSequenceLength: 4, rowCount: 3, targetSequenceLength: 8, timeLimitSeconds: 46 },
  HARD: { columnCount: 4, flashDurationMs: 280, flashGapMs: 110, initialSequenceLength: 4, rowCount: 4, targetSequenceLength: 9, timeLimitSeconds: 58 },
  EXPERT: { columnCount: 4, flashDurationMs: 240, flashGapMs: 90, initialSequenceLength: 5, rowCount: 4, targetSequenceLength: 11, timeLimitSeconds: 72 },
};

function buildSequence(pointCount: number, sequenceLength: number) {
  let previousIndex = -1;

  return Array.from({ length: sequenceLength }, () => {
    let nextIndex = randomInt(pointCount);

    while (pointCount > 1 && nextIndex === previousIndex) {
      nextIndex = randomInt(pointCount);
    }

    previousIndex = nextIndex;
    return nextIndex;
  });
}

function sequenceLengthForRound(config: DifficultyConfig, roundIndex: number) {
  return Math.min(config.targetSequenceLength, config.initialSequenceLength + roundIndex);
}

export function useSequencePointSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [flashingPointIndex, setFlashingPointIndex] = useState<number | null>(null);
  const [inputStep, setInputStep] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [state, setState] = useState<SessionState>("idle");

  const timeoutHandlesRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const pointCount = config.rowCount * config.columnCount;
  const currentSequenceLength = sequenceLengthForRound(config, roundIndex);
  const totalRounds = config.targetSequenceLength - config.initialSequenceLength + 1;

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
    setFlashingPointIndex(null);
    setInputStep(0);
    setMistakeCount(0);
    setRoundIndex(0);
    setSequence([]);
    setState("idle");
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

  function clearWatchPhase() {
    for (const handle of timeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    timeoutHandlesRef.current = [];
  }

  function playWatchPhase(nextSequence: number[]) {
    clearWatchPhase();

    const stepDuration = config.flashDurationMs + config.flashGapMs;

    for (let index = 0; index < nextSequence.length; index += 1) {
      const onHandle = startBrowserTimeout(() => {
        setFlashingPointIndex(nextSequence[index]);
      }, index * stepDuration);
      const offHandle = startBrowserTimeout(() => {
        setFlashingPointIndex(null);
      }, index * stepDuration + config.flashDurationMs);

      if (onHandle !== null) {
        timeoutHandlesRef.current.push(onHandle);
      }

      if (offHandle !== null) {
        timeoutHandlesRef.current.push(offHandle);
      }
    }

    const finishHandle = startBrowserTimeout(() => {
      setFlashingPointIndex(null);
      setState((current) => (current === "watching" ? "inputting" : current));
    }, nextSequence.length * stepDuration);

    if (finishHandle !== null) {
      timeoutHandlesRef.current.push(finishHandle);
    }
  }

  function openRound(nextRoundIndex: number) {
    const nextSequenceLength = sequenceLengthForRound(config, nextRoundIndex);
    const nextSequence = buildSequence(pointCount, nextSequenceLength);

    setRoundIndex(nextRoundIndex);
    setSequence(nextSequence);
    setInputStep(0);
    setFlashingPointIndex(null);
    setState("watching");
    playWatchPhase(nextSequence);
  }

  function beginRun() {
    setElapsedSeconds(0);
    setMistakeCount(0);
    openRound(0);
  }

  function tapPoint(pointIndex: number) {
    if (state !== "inputting") {
      return "ignored" as const;
    }

    const expectedPoint = sequence[inputStep];

    if (expectedPoint !== pointIndex) {
      setMistakeCount((current) => current + 1);
      return "wrong" as const;
    }

    const nextInputStep = inputStep + 1;

    if (nextInputStep >= sequence.length) {
      if (sequence.length >= config.targetSequenceLength) {
        setState("cleared");
        return "correct" as const;
      }

      openRound(roundIndex + 1);
      return "correct" as const;
    }

    setInputStep(nextInputStep);
    return "correct" as const;
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    currentSequenceLength,
    elapsedSeconds,
    flashingPointIndex,
    inputStep,
    mistakeCount,
    pointCount,
    roundIndex,
    rowCount: config.rowCount,
    sequence,
    state,
    tapPoint,
    targetSequenceLength: config.targetSequenceLength,
    timeLimitSeconds: config.timeLimitSeconds,
    totalRounds,
  };
}
