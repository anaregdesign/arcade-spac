import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "inputting" | "cleared" | "failed";

const PAD_COLORS = [
  "amber",
  "coral",
  "mint",
  "sky",
  "plum",
  "slate",
  "teal",
  "rose",
  "indigo",
] as const;

export type PadColor = (typeof PAD_COLORS)[number];

export type Pad = {
  color: PadColor;
  index: number;
};

type DifficultyConfig = {
  columns: number;
  /** Duration in ms each pad stays lit during the watch phase. */
  flashDurationMs: number;
  /** Gap in ms between consecutive pad flashes during the watch phase. */
  flashGapMs: number;
  /** Total number of pads in the grid (padCount must be <= PAD_COLORS.length). */
  padCount: number;
  sequenceLength: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columns: 3, flashDurationMs: 300, flashGapMs: 120, padCount: 6, sequenceLength: 4, timeLimitSeconds: 45 },
  NORMAL: { columns: 3, flashDurationMs: 250, flashGapMs: 100, padCount: 9, sequenceLength: 6, timeLimitSeconds: 60 },
  HARD: { columns: 3, flashDurationMs: 220, flashGapMs: 90, padCount: 9, sequenceLength: 8, timeLimitSeconds: 75 },
  EXPERT: { columns: 3, flashDurationMs: 200, flashGapMs: 80, padCount: 9, sequenceLength: 10, timeLimitSeconds: 90 },
};

function buildPads(padCount: number): Pad[] {
  return Array.from({ length: padCount }, (_, index) => ({
    color: PAD_COLORS[index % PAD_COLORS.length],
    index,
  }));
}

function buildSequence(sequenceLength: number, padCount: number): number[] {
  return Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * padCount));
}

export function usePatternEchoSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [pads] = useState<Pad[]>(() => buildPads(config.padCount));
  const [sequence, setSequence] = useState<number[]>([]);
  const [state, setState] = useState<SessionState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wrongInputCount, setWrongInputCount] = useState(0);
  const [flashingPadIndex, setFlashingPadIndex] = useState<number | null>(null);
  const [inputStep, setInputStep] = useState(0);

  const flashTimeoutsRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      for (const t of flashTimeoutsRef.current) {
        clearBrowserTimeout(t);
      }

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

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

  function clearFlashTimeouts() {
    for (const t of flashTimeoutsRef.current) {
      clearBrowserTimeout(t);
    }

    flashTimeoutsRef.current = [];
  }

  function playWatchSequence(seq: number[]) {
    clearFlashTimeouts();
    const { flashDurationMs, flashGapMs } = difficultyConfig[difficulty];
    const stepDuration = flashDurationMs + flashGapMs;
    let offset = 0;

    for (let step = 0; step < seq.length; step += 1) {
      const padIndex = seq[step];
      const flashOn = startBrowserTimeout(() => {
        setFlashingPadIndex(padIndex);
      }, offset);

      if (flashOn !== null) {
        flashTimeoutsRef.current.push(flashOn);
      }
      offset += flashDurationMs;

      const flashOff = startBrowserTimeout(() => {
        setFlashingPadIndex(null);
      }, offset);

      if (flashOff !== null) {
        flashTimeoutsRef.current.push(flashOff);
      }
      offset += flashGapMs;
    }

    const finishWatch = startBrowserTimeout(() => {
      setState((current) => (current === "watching" ? "inputting" : current));
    }, seq.length * stepDuration);

    if (finishWatch !== null) {
      flashTimeoutsRef.current.push(finishWatch);
    }
  }

  function beginRun() {
    clearFlashTimeouts();
    const newSequence = buildSequence(config.sequenceLength, config.padCount);
    setSequence(newSequence);
    setElapsedSeconds(0);
    setWrongInputCount(0);
    setFlashingPadIndex(null);
    setInputStep(0);
    setState("watching");
    playWatchSequence(newSequence);
  }

  function tapPad(padIndex: number) {
    if (state !== "inputting") {
      return;
    }

    const expected = sequence[inputStep];

    if (padIndex !== expected) {
      setWrongInputCount((current) => current + 1);
      return;
    }

    const nextStep = inputStep + 1;

    if (nextStep >= sequence.length) {
      setState("cleared");
      return;
    }

    setInputStep(nextStep);
  }

  return {
    beginRun,
    columns: config.columns,
    elapsedSeconds,
    flashingPadIndex,
    inputStep,
    pads,
    sequenceLength: config.sequenceLength,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    tapPad,
    wrongInputCount,
  };
}
