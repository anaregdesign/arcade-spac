import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type HoldWindow = "good" | "miss" | "perfect";
type HoldReleaseResult = HoldWindow | "ignored";

type DifficultyConfig = {
  goodToleranceMs: number;
  perfectToleranceMs: number;
  roundGoal: number;
  targetRangeMs: [number, number];
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { goodToleranceMs: 140, perfectToleranceMs: 70, roundGoal: 4, targetRangeMs: [520, 880], timeLimitSeconds: 40 },
  NORMAL: { goodToleranceMs: 125, perfectToleranceMs: 60, roundGoal: 5, targetRangeMs: [560, 980], timeLimitSeconds: 48 },
  HARD: { goodToleranceMs: 110, perfectToleranceMs: 52, roundGoal: 6, targetRangeMs: [620, 1080], timeLimitSeconds: 60 },
  EXPERT: { goodToleranceMs: 95, perfectToleranceMs: 45, roundGoal: 7, targetRangeMs: [680, 1180], timeLimitSeconds: 74 },
};

function getHoldWindow(holdElapsedMs: number, targetDurationMs: number, perfectToleranceMs: number, goodToleranceMs: number): HoldWindow {
  const deltaMs = Math.abs(holdElapsedMs - targetDurationMs);

  if (deltaMs <= perfectToleranceMs) {
    return "perfect";
  }

  if (deltaMs <= goodToleranceMs) {
    return "good";
  }

  return "miss";
}

function randomIntInRange(minInclusive: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function buildTargetDuration(config: DifficultyConfig, previousTargetMs: number | null, preview = false) {
  if (preview) {
    return Math.round((config.targetRangeMs[0] + config.targetRangeMs[1]) / 2);
  }

  let nextTargetMs = randomIntInRange(config.targetRangeMs[0], config.targetRangeMs[1]);

  if (previousTargetMs === null) {
    return nextTargetMs;
  }

  while (Math.abs(nextTargetMs - previousTargetMs) < 120) {
    nextTargetMs = randomIntInRange(config.targetRangeMs[0], config.targetRangeMs[1]);
  }

  return nextTargetMs;
}

export function useTempoHoldSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewTargetDurationMs = useMemo(() => buildTargetDuration(config, null, true), [config]);
  const [completedRoundCount, setCompletedRoundCount] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentWindow, setCurrentWindow] = useState<HoldWindow>("miss");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [goodReleaseCount, setGoodReleaseCount] = useState(0);
  const [holdElapsedMs, setHoldElapsedMs] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [lastJudgment, setLastJudgment] = useState<HoldWindow | null>(null);
  const [missCount, setMissCount] = useState(0);
  const [perfectReleaseCount, setPerfectReleaseCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [targetDurationMs, setTargetDurationMs] = useState(previewTargetDurationMs);

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const completedRoundCountRef = useRef(0);
  const currentWindowRef = useRef<HoldWindow>("miss");
  const goodReleaseCountRef = useRef(0);
  const holdElapsedMsRef = useRef(0);
  const holdStartedAtRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  const missCountRef = useRef(0);
  const perfectReleaseCountRef = useRef(0);
  const previousTargetDurationMsRef = useRef<number | null>(null);
  const releaseCountRef = useRef(0);
  const runStartTimeRef = useRef<number | null>(null);
  const targetDurationMsRef = useRef(previewTargetDurationMs);
  const totalReleaseDeltaMsRef = useRef(0);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    completedRoundCountRef.current = 0;
    currentWindowRef.current = "miss";
    goodReleaseCountRef.current = 0;
    holdElapsedMsRef.current = 0;
    holdStartedAtRef.current = null;
    isHoldingRef.current = false;
    missCountRef.current = 0;
    perfectReleaseCountRef.current = 0;
    previousTargetDurationMsRef.current = null;
    releaseCountRef.current = 0;
    runStartTimeRef.current = null;
    targetDurationMsRef.current = previewTargetDurationMs;
    totalReleaseDeltaMsRef.current = 0;

    setCompletedRoundCount(0);
    setCurrentRoundIndex(0);
    setCurrentWindow("miss");
    setElapsedSeconds(0);
    setGoodReleaseCount(0);
    setHoldElapsedMs(0);
    setIsHolding(false);
    setLastJudgment(null);
    setMissCount(0);
    setPerfectReleaseCount(0);
    setState("idle");
    setTargetDurationMs(previewTargetDurationMs);
  }, [config, previewTargetDurationMs]);

  useEffect(() => {
    if (state !== "playing") {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (runStartTimeRef.current === null) {
        runStartTimeRef.current = timestamp;
      }

      const runElapsedMs = timestamp - runStartTimeRef.current;
      const elapsed = Math.min(config.timeLimitSeconds, Math.floor(runElapsedMs / 1000));

      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));

      if (isHoldingRef.current && holdStartedAtRef.current !== null) {
        const nextHoldElapsedMs = timestamp - holdStartedAtRef.current;
        const nextWindow = getHoldWindow(
          nextHoldElapsedMs,
          targetDurationMsRef.current,
          config.perfectToleranceMs,
          config.goodToleranceMs,
        );

        holdElapsedMsRef.current = nextHoldElapsedMs;
        currentWindowRef.current = nextWindow;
        setHoldElapsedMs(nextHoldElapsedMs);
        setCurrentWindow(nextWindow);
      }

      if (runElapsedMs >= config.timeLimitSeconds * 1000) {
        setElapsedSeconds(config.timeLimitSeconds);
        setState((current) => (current === "playing" ? "failed" : current));
        return;
      }

      animationFrameRef.current = requestBrowserAnimationFrame(loop);
    };

    animationFrameRef.current = requestBrowserAnimationFrame(loop);

    return () => cancelBrowserAnimationFrame(animationFrameRef.current);
  }, [config, state]);

  function beginRun() {
    const firstTargetDurationMs = buildTargetDuration(config, null);

    cancelBrowserAnimationFrame(animationFrameRef.current);
    completedRoundCountRef.current = 0;
    currentWindowRef.current = "miss";
    goodReleaseCountRef.current = 0;
    holdElapsedMsRef.current = 0;
    holdStartedAtRef.current = null;
    isHoldingRef.current = false;
    missCountRef.current = 0;
    perfectReleaseCountRef.current = 0;
    previousTargetDurationMsRef.current = firstTargetDurationMs;
    releaseCountRef.current = 0;
    runStartTimeRef.current = null;
    targetDurationMsRef.current = firstTargetDurationMs;
    totalReleaseDeltaMsRef.current = 0;

    setCompletedRoundCount(0);
    setCurrentRoundIndex(0);
    setCurrentWindow("miss");
    setElapsedSeconds(0);
    setGoodReleaseCount(0);
    setHoldElapsedMs(0);
    setIsHolding(false);
    setLastJudgment(null);
    setMissCount(0);
    setPerfectReleaseCount(0);
    setState("playing");
    setTargetDurationMs(firstTargetDurationMs);
  }

  function startHold() {
    if (state !== "playing" || isHoldingRef.current) {
      return;
    }

    isHoldingRef.current = true;
    holdStartedAtRef.current = performance.now();
    holdElapsedMsRef.current = 0;
    currentWindowRef.current = getHoldWindow(0, targetDurationMsRef.current, config.perfectToleranceMs, config.goodToleranceMs);

    setCurrentWindow(currentWindowRef.current);
    setHoldElapsedMs(0);
    setIsHolding(true);
  }

  function releaseHold(): HoldReleaseResult {
    if (state !== "playing" || !isHoldingRef.current || holdStartedAtRef.current === null) {
      return "ignored";
    }

    const releasedAt = performance.now();
    const nextHoldElapsedMs = releasedAt - holdStartedAtRef.current;
    const result = getHoldWindow(
      nextHoldElapsedMs,
      targetDurationMsRef.current,
      config.perfectToleranceMs,
      config.goodToleranceMs,
    );
    const deltaMs = Math.abs(nextHoldElapsedMs - targetDurationMsRef.current);
    const nextCompletedRoundCount = completedRoundCountRef.current + 1;

    completedRoundCountRef.current = nextCompletedRoundCount;
    currentWindowRef.current = "miss";
    holdElapsedMsRef.current = 0;
    holdStartedAtRef.current = null;
    isHoldingRef.current = false;
    releaseCountRef.current += 1;
    totalReleaseDeltaMsRef.current += deltaMs;

    setCompletedRoundCount(nextCompletedRoundCount);
    setCurrentWindow("miss");
    setHoldElapsedMs(0);
    setIsHolding(false);
    setLastJudgment(result);

    if (result === "perfect") {
      const nextPerfectReleaseCount = perfectReleaseCountRef.current + 1;

      perfectReleaseCountRef.current = nextPerfectReleaseCount;
      setPerfectReleaseCount(nextPerfectReleaseCount);
    } else if (result === "good") {
      const nextGoodReleaseCount = goodReleaseCountRef.current + 1;

      goodReleaseCountRef.current = nextGoodReleaseCount;
      setGoodReleaseCount(nextGoodReleaseCount);
    } else {
      const nextMissCount = missCountRef.current + 1;

      missCountRef.current = nextMissCount;
      setMissCount(nextMissCount);
    }

    if (nextCompletedRoundCount >= config.roundGoal) {
      setCurrentRoundIndex(config.roundGoal);
      setState("cleared");
      return result;
    }

    const nextTargetDurationMs = buildTargetDuration(config, previousTargetDurationMsRef.current);

    previousTargetDurationMsRef.current = nextTargetDurationMs;
    targetDurationMsRef.current = nextTargetDurationMs;

    setCurrentRoundIndex(nextCompletedRoundCount);
    setTargetDurationMs(nextTargetDurationMs);

    return result;
  }

  const maxMeterDurationMs = config.targetRangeMs[1] + config.goodToleranceMs + 240;
  const averageReleaseDeltaMs = releaseCountRef.current === 0 ? 0 : Math.round(totalReleaseDeltaMsRef.current / releaseCountRef.current);

  return {
    averageReleaseDeltaMs,
    beginRun,
    completedRoundCount,
    currentRoundIndex,
    currentWindow,
    elapsedSeconds,
    goodReleaseCount,
    holdElapsedMs,
    isHolding,
    lastJudgment,
    maxMeterDurationMs,
    missCount,
    perfectReleaseCount,
    perfectToleranceMs: config.perfectToleranceMs,
    releaseHold,
    startHold,
    state,
    targetDurationMs,
    timeLimitSeconds: config.timeLimitSeconds,
    roundGoal: config.roundGoal,
    goodToleranceMs: config.goodToleranceMs,
  };
}
