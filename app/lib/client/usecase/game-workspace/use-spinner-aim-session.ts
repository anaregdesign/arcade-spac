import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type ShotResult = "hazard" | "ignored" | "miss" | "target";
type ShotWindow = "hazard" | "miss" | "target";

type DifficultyConfig = {
  hazardHalfWidthDeg: number;
  hitGoal: number;
  radiusPx: number;
  speedDegPerSecond: number;
  targetHalfWidthDeg: number;
  timeLimitSeconds: number;
  wobbleDeg: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { hazardHalfWidthDeg: 14, hitGoal: 4, radiusPx: 108, speedDegPerSecond: 104, targetHalfWidthDeg: 18, timeLimitSeconds: 40, wobbleDeg: 8 },
  NORMAL: { hazardHalfWidthDeg: 12, hitGoal: 5, radiusPx: 112, speedDegPerSecond: 128, targetHalfWidthDeg: 16, timeLimitSeconds: 48, wobbleDeg: 10 },
  HARD: { hazardHalfWidthDeg: 11, hitGoal: 6, radiusPx: 118, speedDegPerSecond: 156, targetHalfWidthDeg: 14, timeLimitSeconds: 60, wobbleDeg: 12 },
  EXPERT: { hazardHalfWidthDeg: 10, hitGoal: 7, radiusPx: 124, speedDegPerSecond: 188, targetHalfWidthDeg: 12, timeLimitSeconds: 74, wobbleDeg: 15 },
};

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function getAngularDistance(left: number, right: number) {
  const delta = Math.abs(normalizeAngle(left) - normalizeAngle(right));
  return Math.min(delta, 360 - delta);
}

function pickAngle(previousAngle: number | null) {
  if (previousAngle === null) {
    return Math.floor(Math.random() * 360);
  }

  let nextAngle = previousAngle;

  while (getAngularDistance(nextAngle, previousAngle) < 76) {
    nextAngle = Math.floor(Math.random() * 360);
  }

  return nextAngle;
}

function pickArcAngles(previousTargetAngle: number | null) {
  const targetAngle = pickAngle(previousTargetAngle);
  let hazardAngle = Math.floor(Math.random() * 360);

  while (getAngularDistance(hazardAngle, targetAngle) < 70) {
    hazardAngle = Math.floor(Math.random() * 360);
  }

  return { hazardAngle, targetAngle };
}

function getShotWindow(
  launcherAngle: number,
  targetAngle: number,
  targetHalfWidthDeg: number,
  hazardAngle: number,
  hazardHalfWidthDeg: number,
): ShotWindow {
  if (getAngularDistance(launcherAngle, targetAngle) <= targetHalfWidthDeg) {
    return "target";
  }

  if (getAngularDistance(launcherAngle, hazardAngle) <= hazardHalfWidthDeg) {
    return "hazard";
  }

  return "miss";
}

export function useSpinnerAimSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hazardAngle, setHazardAngle] = useState(204);
  const [hazardHitCount, setHazardHitCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [launcherAngle, setLauncherAngle] = useState(0);
  const [lastShotWindow, setLastShotWindow] = useState<ShotWindow | null>(null);
  const [missCount, setMissCount] = useState(0);
  const [shotCount, setShotCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [targetAngle, setTargetAngle] = useState(26);

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTapAtRef = useRef(0);
  const launcherAngleRef = useRef(0);
  const hitCountRef = useRef(0);
  const hazardHitCountRef = useRef(0);
  const missCountRef = useRef(0);
  const shotCountRef = useRef(0);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;
    lastTapAtRef.current = 0;
    launcherAngleRef.current = 0;
    hitCountRef.current = 0;
    hazardHitCountRef.current = 0;
    missCountRef.current = 0;
    shotCountRef.current = 0;
    setElapsedSeconds(0);
    setHazardAngle(204);
    setHazardHitCount(0);
    setHitCount(0);
    setLauncherAngle(0);
    setLastShotWindow(null);
    setMissCount(0);
    setShotCount(0);
    setState("idle");
    setTargetAngle(26);
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsedMs = timestamp - startTimeRef.current;
      const elapsed = Math.min(config.timeLimitSeconds, Math.floor(elapsedMs / 1000));
      const oscillation = Math.sin(elapsedMs / 420) * config.wobbleDeg;
      const nextLauncherAngle = normalizeAngle((elapsedMs * config.speedDegPerSecond) / 1000 + oscillation);

      launcherAngleRef.current = nextLauncherAngle;
      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));
      setLauncherAngle(nextLauncherAngle);

      if (elapsedMs >= config.timeLimitSeconds * 1000) {
        setElapsedSeconds(config.timeLimitSeconds);
        setState((current) => (current === "playing" ? "failed" : current));
        return;
      }

      animationFrameRef.current = requestBrowserAnimationFrame(loop);
    };

    animationFrameRef.current = requestBrowserAnimationFrame(loop);

    return () => cancelBrowserAnimationFrame(animationFrameRef.current);
  }, [config.speedDegPerSecond, config.timeLimitSeconds, config.wobbleDeg, state]);

  function beginRun() {
    const nextAngles = pickArcAngles(null);

    cancelBrowserAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;
    lastTapAtRef.current = 0;
    launcherAngleRef.current = 0;
    hitCountRef.current = 0;
    hazardHitCountRef.current = 0;
    missCountRef.current = 0;
    shotCountRef.current = 0;
    setElapsedSeconds(0);
    setHazardAngle(nextAngles.hazardAngle);
    setHazardHitCount(0);
    setHitCount(0);
    setLauncherAngle(0);
    setLastShotWindow(null);
    setMissCount(0);
    setShotCount(0);
    setState("playing");
    setTargetAngle(nextAngles.targetAngle);
  }

  function fireShot(): ShotResult {
    if (state !== "playing") {
      return "ignored";
    }

    const now = Date.now();

    if (now - lastTapAtRef.current < 120) {
      return "ignored";
    }

    lastTapAtRef.current = now;
    const shotWindow = getShotWindow(
      launcherAngleRef.current,
      targetAngle,
      config.targetHalfWidthDeg,
      hazardAngle,
      config.hazardHalfWidthDeg,
    );
    const nextShotCount = shotCountRef.current + 1;

    shotCountRef.current = nextShotCount;
    setShotCount(nextShotCount);
    setLastShotWindow(shotWindow);

    if (shotWindow === "target") {
      const nextHitCount = hitCountRef.current + 1;

      hitCountRef.current = nextHitCount;
      setHitCount(nextHitCount);

      if (nextHitCount >= config.hitGoal) {
        setState("cleared");
        return "target";
      }

      const nextAngles = pickArcAngles(targetAngle);
      setTargetAngle(nextAngles.targetAngle);
      setHazardAngle(nextAngles.hazardAngle);
      return "target";
    }

    if (shotWindow === "hazard") {
      const nextHazardHitCount = hazardHitCountRef.current + 1;

      hazardHitCountRef.current = nextHazardHitCount;
      setHazardHitCount(nextHazardHitCount);
      return "hazard";
    }

    const nextMissCount = missCountRef.current + 1;

    missCountRef.current = nextMissCount;
    setMissCount(nextMissCount);
    return "miss";
  }

  const currentWindow = getShotWindow(
    launcherAngle,
    targetAngle,
    config.targetHalfWidthDeg,
    hazardAngle,
    config.hazardHalfWidthDeg,
  );
  const accuracyPercent = shotCount === 0 ? 100 : Math.round((hitCount / shotCount) * 100);

  return {
    accuracyPercent,
    beginRun,
    currentWindow,
    elapsedSeconds,
    fireShot,
    hazardAngle,
    hazardHalfWidthDeg: config.hazardHalfWidthDeg,
    hazardHitCount,
    hitCount,
    hitGoal: config.hitGoal,
    launcherAngle,
    lastShotWindow,
    missCount,
    radiusPx: config.radiusPx,
    shotCount,
    state,
    targetAngle,
    targetHalfWidthDeg: config.targetHalfWidthDeg,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
