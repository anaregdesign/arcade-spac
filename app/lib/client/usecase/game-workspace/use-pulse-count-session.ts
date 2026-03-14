import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import { randomIntInRange, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "answering" | "cleared" | "failed";

type PulseRound = {
  answer: number;
  choices: number[];
};

type DifficultyConfig = {
  maxPulseCount: number;
  pulseDurationMs: number;
  pulseGapMs: number;
  roundCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { maxPulseCount: 5, pulseDurationMs: 320, pulseGapMs: 240, roundCount: 3, timeLimitSeconds: 32 },
  NORMAL: { maxPulseCount: 6, pulseDurationMs: 300, pulseGapMs: 220, roundCount: 4, timeLimitSeconds: 42 },
  HARD: { maxPulseCount: 7, pulseDurationMs: 280, pulseGapMs: 190, roundCount: 5, timeLimitSeconds: 52 },
  EXPERT: { maxPulseCount: 8, pulseDurationMs: 250, pulseGapMs: 170, roundCount: 6, timeLimitSeconds: 66 },
};

function buildChoices(answer: number) {
  const choices = new Set<number>([answer]);

  while (choices.size < 4) {
    const offset = randomIntInRange(-2, 2);
    const candidate = Math.max(1, Math.min(9, answer + offset + (offset >= 0 ? 1 : 0)));
    choices.add(candidate);
  }

  return shuffleValues([...choices]);
}

function buildRounds(roundCount: number, maxPulseCount: number): PulseRound[] {
  return Array.from({ length: roundCount }, () => {
    const answer = randomIntInRange(2, maxPulseCount);

    return {
      answer,
      choices: buildChoices(answer),
    };
  });
}

export function usePulseCountSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSignalLit, setIsSignalLit] = useState(false);
  const [rounds, setRounds] = useState<PulseRound[]>([]);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);

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

    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setIsSignalLit(false);
    setRounds([]);
    setState("idle");
    setWrongAnswerCount(0);
  }, [config]);

  useEffect(() => {
    if (state !== "watching" && state !== "answering") {
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
            currentState === "watching" || currentState === "answering" ? "failed" : currentState,
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

  function queueWatchPhase(roundIndex: number, nextRounds: PulseRound[]) {
    for (const handle of timeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    timeoutHandlesRef.current = [];
    setIsSignalLit(false);
    setState("watching");

    const round = nextRounds[roundIndex];

    for (let pulseIndex = 0; pulseIndex < round.answer; pulseIndex += 1) {
      const litOnHandle = startBrowserTimeout(() => {
        setIsSignalLit(true);
      }, pulseIndex * (config.pulseDurationMs + config.pulseGapMs));
      const litOffHandle = startBrowserTimeout(() => {
        setIsSignalLit(false);
      }, pulseIndex * (config.pulseDurationMs + config.pulseGapMs) + config.pulseDurationMs);

      if (litOnHandle !== null) {
        timeoutHandlesRef.current.push(litOnHandle);
      }

      if (litOffHandle !== null) {
        timeoutHandlesRef.current.push(litOffHandle);
      }
    }

    const finishHandle = startBrowserTimeout(() => {
      setIsSignalLit(false);
      setState((current) => (current === "watching" ? "answering" : current));
    }, round.answer * (config.pulseDurationMs + config.pulseGapMs));

    if (finishHandle !== null) {
      timeoutHandlesRef.current.push(finishHandle);
    }
  }

  function beginRun() {
    const nextRounds = buildRounds(config.roundCount, config.maxPulseCount);

    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setRounds(nextRounds);
    setWrongAnswerCount(0);
    queueWatchPhase(0, nextRounds);
  }

  function answerRound(value: number) {
    if (state !== "answering") {
      return "ignored";
    }

    if (value !== rounds[currentRoundIndex]?.answer) {
      setWrongAnswerCount((current) => current + 1);
    }

    const nextRoundIndex = currentRoundIndex + 1;

    if (nextRoundIndex >= rounds.length) {
      setState("cleared");
      return value === rounds[currentRoundIndex]?.answer ? "correct" : "wrong";
    }

    setCurrentRoundIndex(nextRoundIndex);
    queueWatchPhase(nextRoundIndex, rounds);
    return value === rounds[currentRoundIndex]?.answer ? "correct" : "wrong";
  }

  return {
    answerRound,
    beginRun,
    currentRound: rounds[currentRoundIndex] ?? null,
    currentRoundIndex,
    elapsedSeconds,
    isSignalLit,
    roundCount: config.roundCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongAnswerCount,
  };
}
