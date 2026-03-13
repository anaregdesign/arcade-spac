import { useEffect, useRef, useState } from "react";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

const laneHeight = 420;
const lineCenterY = 308;
const ballRadius = 22;

const difficultyConfig: Record<Difficulty, { speedPxPerSecond: number; spawnRange: [number, number] }> = {
  EASY: { speedPxPerSecond: 190, spawnRange: [42, 118] },
  NORMAL: { speedPxPerSecond: 250, spawnRange: [36, 104] },
  HARD: { speedPxPerSecond: 320, spawnRange: [28, 92] },
  EXPERT: { speedPxPerSecond: 395, spawnRange: [20, 82] },
};

function getRandomSpawnY([min, max]: [number, number]) {
  return Math.round(min + (Math.random() * (max - min)));
}

function getOffsetPx(ballCenterY: number) {
  return Math.abs(Math.round(lineCenterY - ballCenterY));
}

export function useDropLineSession(difficulty: Difficulty) {
  const animationFrameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const difficultySettings = difficultyConfig[difficulty];
  const [ballCenterY, setBallCenterY] = useState(() => getRandomSpawnY(difficultySettings.spawnRange));
  const [elapsedMs, setElapsedMs] = useState(0);
  const [resolvedOffsetPx, setResolvedOffsetPx] = useState<number | null>(null);
  const [spawnY, setSpawnY] = useState(() => getRandomSpawnY(difficultySettings.spawnRange));
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setBallCenterY(getRandomSpawnY(difficultySettings.spawnRange));
    setElapsedMs(0);
    setResolvedOffsetPx(null);
    setSpawnY(getRandomSpawnY(difficultySettings.spawnRange));
    setState("idle");
    startedAtRef.current = null;

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [difficultySettings.spawnRange]);

  useEffect(() => {
    if (state !== "playing") {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return undefined;
    }

    const tick = (now: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = now;
      }

      const nextElapsedMs = now - startedAtRef.current;
      const nextBallCenterY = spawnY + ((nextElapsedMs / 1000) * difficultySettings.speedPxPerSecond);
      const nextOffsetPx = getOffsetPx(nextBallCenterY);

      setElapsedMs(nextElapsedMs);

      if (nextBallCenterY - ballRadius > laneHeight) {
        setBallCenterY(nextBallCenterY);
        setResolvedOffsetPx(nextOffsetPx);
        setState("failed");
        animationFrameRef.current = null;
        return;
      }

      setBallCenterY(nextBallCenterY);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [difficultySettings.speedPxPerSecond, spawnY, state]);

  function beginRun() {
    const nextSpawnY = getRandomSpawnY(difficultySettings.spawnRange);

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    startedAtRef.current = null;
    setBallCenterY(nextSpawnY);
    setElapsedMs(0);
    setResolvedOffsetPx(null);
    setSpawnY(nextSpawnY);
    setState("playing");
  }

  function captureHit() {
    if (state !== "playing") {
      return;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
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
    speedPxPerSecond: difficultySettings.speedPxPerSecond,
    state,
  };
}
