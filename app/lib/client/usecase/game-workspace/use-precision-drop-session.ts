import { useEffect, useRef, useState } from "react";

import { cancelBrowserAnimationFrame, requestBrowserAnimationFrame } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

const laneHeight = 420;
const lineCenterY = 308;
const ballRadius = 18;
const idleBallCenterY = 96;

const difficultyConfig: Record<Difficulty, { initialSpeedPxPerSecond: number; accelerationPxPerSecondSquared: number; spawnRange: [number, number] }> = {
  EASY: { initialSpeedPxPerSecond: 72, accelerationPxPerSecondSquared: 560, spawnRange: [42, 118] },
  NORMAL: { initialSpeedPxPerSecond: 88, accelerationPxPerSecondSquared: 720, spawnRange: [36, 104] },
  HARD: { initialSpeedPxPerSecond: 104, accelerationPxPerSecondSquared: 900, spawnRange: [28, 92] },
  EXPERT: { initialSpeedPxPerSecond: 120, accelerationPxPerSecondSquared: 1080, spawnRange: [20, 82] },
};

function getRandomSpawnY([min, max]: [number, number]) {
  return Math.round(min + (Math.random() * (max - min)));
}

function getOffsetPx(ballCenterY: number) {
  return Math.abs(Math.round(lineCenterY - ballCenterY));
}

export function usePrecisionDropSession(difficulty: Difficulty) {
  const animationFrameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const difficultySettings = difficultyConfig[difficulty];
  const [ballCenterY, setBallCenterY] = useState(idleBallCenterY);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [resolvedOffsetPx, setResolvedOffsetPx] = useState<number | null>(null);
  const [speedPxPerSecond, setSpeedPxPerSecond] = useState(0);
  const [spawnY, setSpawnY] = useState(idleBallCenterY);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setBallCenterY(idleBallCenterY);
    setElapsedMs(0);
    setResolvedOffsetPx(null);
    setSpeedPxPerSecond(0);
    setSpawnY(idleBallCenterY);
    setState("idle");
    startedAtRef.current = null;

    if (animationFrameRef.current !== null) {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [difficulty]);

  useEffect(() => {
    if (state !== "playing") {
      if (animationFrameRef.current !== null) {
        cancelBrowserAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return undefined;
    }

    const tick = (now: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = now;
      }

      const nextElapsedMs = now - startedAtRef.current;
      const elapsedSeconds = nextElapsedMs / 1000;
      const nextSpeedPxPerSecond = difficultySettings.initialSpeedPxPerSecond
        + (difficultySettings.accelerationPxPerSecondSquared * elapsedSeconds);
      const nextBallCenterY = spawnY
        + (difficultySettings.initialSpeedPxPerSecond * elapsedSeconds)
        + (0.5 * difficultySettings.accelerationPxPerSecondSquared * elapsedSeconds * elapsedSeconds);
      const nextOffsetPx = getOffsetPx(nextBallCenterY);

      setElapsedMs(nextElapsedMs);
      setSpeedPxPerSecond(Math.round(nextSpeedPxPerSecond));

      if (nextBallCenterY - ballRadius > laneHeight) {
        setBallCenterY(nextBallCenterY);
        setResolvedOffsetPx(nextOffsetPx);
        setState("failed");
        animationFrameRef.current = null;
        return;
      }

      setBallCenterY(nextBallCenterY);
      animationFrameRef.current = requestBrowserAnimationFrame(tick);
    };

    animationFrameRef.current = requestBrowserAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelBrowserAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [difficultySettings.accelerationPxPerSecondSquared, difficultySettings.initialSpeedPxPerSecond, spawnY, state]);

  function beginRun() {
    const nextSpawnY = getRandomSpawnY(difficultySettings.spawnRange);

    if (animationFrameRef.current !== null) {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    startedAtRef.current = null;
    setBallCenterY(nextSpawnY);
    setElapsedMs(0);
    setResolvedOffsetPx(null);
    setSpeedPxPerSecond(difficultySettings.initialSpeedPxPerSecond);
    setSpawnY(nextSpawnY);
    setState("playing");
  }

  function captureHit() {
    if (state !== "playing") {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setResolvedOffsetPx(getOffsetPx(ballCenterY));
    setState("cleared");
  }

  return {
    ballCenterY,
    ballRadius,
    beginRun,
    captureHit,
    currentOffsetPx: getOffsetPx(ballCenterY),
    elapsedMs,
    laneHeight,
    lineCenterY,
    resolvedOffsetPx,
    speedPxPerSecond,
    state,
  };
}
