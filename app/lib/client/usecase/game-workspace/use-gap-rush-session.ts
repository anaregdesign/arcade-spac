import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type DifficultyConfig = {
  gapHalfWidth: number;
  laneCount: number;
  moveSpeed: number;
  perfectWindow: number;
  speedRamp: number;
  startWallSpeed: number;
  targetWallCount: number;
  timeLimitSeconds: number;
  wallSequence: number[];
};

const baseWallSequence = [2, 4, 1, 3, 0, 2, 4, 1, 3, 2, 0, 4, 1, 3, 2, 0, 4, 2] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    gapHalfWidth: 0.68,
    laneCount: 5,
    moveSpeed: 6.2,
    perfectWindow: 0.16,
    speedRamp: 0.025,
    startWallSpeed: 0.72,
    targetWallCount: 6,
    timeLimitSeconds: 42,
    wallSequence: [...baseWallSequence],
  },
  NORMAL: {
    gapHalfWidth: 0.62,
    laneCount: 5,
    moveSpeed: 6.1,
    perfectWindow: 0.15,
    speedRamp: 0.028,
    startWallSpeed: 0.79,
    targetWallCount: 8,
    timeLimitSeconds: 54,
    wallSequence: [...baseWallSequence],
  },
  HARD: {
    gapHalfWidth: 0.56,
    laneCount: 5,
    moveSpeed: 6.0,
    perfectWindow: 0.14,
    speedRamp: 0.03,
    startWallSpeed: 0.87,
    targetWallCount: 10,
    timeLimitSeconds: 68,
    wallSequence: [...baseWallSequence],
  },
  EXPERT: {
    gapHalfWidth: 0.5,
    laneCount: 5,
    moveSpeed: 5.9,
    perfectWindow: 0.12,
    speedRamp: 0.032,
    startWallSpeed: 0.95,
    targetWallCount: 12,
    timeLimitSeconds: 82,
    wallSequence: [...baseWallSequence],
  },
};

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}

export function useGapRushSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const initialLane = Math.floor(config.laneCount / 2);
  const [avatarPosition, setAvatarPosition] = useState(initialLane);
  const [clearedCount, setClearedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActionLabel, setLastActionLabel] = useState("Start the corridor to begin the rush.");
  const [perfectPassCount, setPerfectPassCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [targetLane, setTargetLane] = useState(initialLane);
  const [wallProgress, setWallProgress] = useState(0);

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const avatarPositionRef = useRef(initialLane);
  const clearedCountRef = useRef(0);
  const perfectPassCountRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const stateRef = useRef<SessionState>("idle");
  const targetLaneRef = useRef(initialLane);
  const wallProgressRef = useRef(0);
  const previousTimestampRef = useRef<number | null>(null);

  function clearAnimation() {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }

  function syncIdleState() {
    const centerLane = Math.floor(config.laneCount / 2);

    avatarPositionRef.current = centerLane;
    clearedCountRef.current = 0;
    perfectPassCountRef.current = 0;
    startTimeRef.current = null;
    stateRef.current = "idle";
    targetLaneRef.current = centerLane;
    wallProgressRef.current = 0;
    previousTimestampRef.current = null;

    setAvatarPosition(centerLane);
    setClearedCount(0);
    setElapsedSeconds(0);
    setLastActionLabel("Start the corridor to begin the rush.");
    setPerfectPassCount(0);
    setState("idle");
    setTargetLane(centerLane);
    setWallProgress(0);
  }

  useEffect(() => {
    return () => {
      clearAnimation();
    };
  }, []);

  useEffect(() => {
    clearAnimation();
    syncIdleState();
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      clearAnimation();
      return;
    }

    const loop = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        previousTimestampRef.current = timestamp;
      }

      const previousTimestamp = previousTimestampRef.current ?? timestamp;
      const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
      previousTimestampRef.current = timestamp;
      const elapsedMs = timestamp - (startTimeRef.current ?? timestamp);
      const elapsed = Math.min(config.timeLimitSeconds, Math.floor(elapsedMs / 1000));
      const nextAvatarPosition = moveToward(
        avatarPositionRef.current,
        targetLaneRef.current,
        config.moveSpeed * deltaSeconds,
      );

      avatarPositionRef.current = nextAvatarPosition;
      setAvatarPosition(nextAvatarPosition);
      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));

      if (elapsedMs >= config.timeLimitSeconds * 1000) {
        stateRef.current = "failed";
        setState("failed");
        setLastActionLabel("Time expired");
        return;
      }

      let nextWallProgress = wallProgressRef.current + (config.startWallSpeed + clearedCountRef.current * config.speedRamp) * deltaSeconds;

      while (nextWallProgress >= 1) {
        const currentGapLane = config.wallSequence[clearedCountRef.current] ?? config.wallSequence[config.wallSequence.length - 1] ?? 0;
        const offset = Math.abs(nextAvatarPosition - currentGapLane);

        if (offset > config.gapHalfWidth) {
          stateRef.current = "failed";
          setState("failed");
          setLastActionLabel(`Wall ${clearedCountRef.current + 1} clipped the runner`);
          return;
        }

        const nextClearedCount = clearedCountRef.current + 1;
        const isPerfectPass = offset <= config.perfectWindow;
        const nextPerfectPassCount = perfectPassCountRef.current + (isPerfectPass ? 1 : 0);

        clearedCountRef.current = nextClearedCount;
        perfectPassCountRef.current = nextPerfectPassCount;
        setClearedCount(nextClearedCount);
        setPerfectPassCount(nextPerfectPassCount);
        setLastActionLabel(isPerfectPass ? `Wall ${nextClearedCount} perfect` : `Wall ${nextClearedCount} cleared`);

        if (nextClearedCount >= config.targetWallCount) {
          stateRef.current = "cleared";
          setState("cleared");
          setWallProgress(1);
          wallProgressRef.current = 1;
          return;
        }

        nextWallProgress -= 1;
      }

      wallProgressRef.current = nextWallProgress;
      setWallProgress(nextWallProgress);
      animationFrameRef.current = requestBrowserAnimationFrame(loop);
    };

    animationFrameRef.current = requestBrowserAnimationFrame(loop);
    return () => cancelBrowserAnimationFrame(animationFrameRef.current);
  }, [
    config.gapHalfWidth,
    config.laneCount,
    config.moveSpeed,
    config.perfectWindow,
    config.speedRamp,
    config.startWallSpeed,
    config.targetWallCount,
    config.timeLimitSeconds,
    config.wallSequence,
    state,
  ]);

  function beginRun() {
    clearAnimation();
    syncIdleState();
    stateRef.current = "playing";
    setState("playing");
    setLastActionLabel("Corridor live");
  }

  function chooseLane(lane: number) {
    if (stateRef.current !== "playing") {
      return "ignored" as const;
    }

    const nextLane = Math.max(0, Math.min(config.laneCount - 1, lane));

    targetLaneRef.current = nextLane;
    setTargetLane(nextLane);
    setLastActionLabel(`Drifting to lane ${nextLane + 1}`);

    return "armed" as const;
  }

  const currentGapLane = config.wallSequence[Math.min(clearedCount, config.wallSequence.length - 1)] ?? 0;
  const nextGapLane = clearedCount + 1 < config.targetWallCount
    ? config.wallSequence[Math.min(clearedCount + 1, config.wallSequence.length - 1)] ?? null
    : null;
  const currentSpeed = config.startWallSpeed + clearedCount * config.speedRamp;

  return {
    avatarPosition,
    beginRun,
    chooseLane,
    clearedCount,
    currentGapLane,
    currentSpeed,
    elapsedSeconds,
    gapHalfWidth: config.gapHalfWidth,
    laneCount: config.laneCount,
    lastActionLabel,
    nextGapLane,
    perfectPassCount,
    solutionLane: currentGapLane,
    state,
    targetLane,
    targetWallCount: config.targetWallCount,
    timeLimitSeconds: config.timeLimitSeconds,
    wallProgress,
  };
}
