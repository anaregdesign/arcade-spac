import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type TapResult = "hit" | "ignored" | "miss";

type DifficultyConfig = {
  gateHalfWidthDeg: number;
  hitGoal: number;
  radiusPx: number;
  speedDegPerSecond: number;
  timeLimitSeconds: number;
  wobbleDeg: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { gateHalfWidthDeg: 22, hitGoal: 4, radiusPx: 102, speedDegPerSecond: 118, timeLimitSeconds: 38, wobbleDeg: 10 },
  NORMAL: { gateHalfWidthDeg: 19, hitGoal: 5, radiusPx: 106, speedDegPerSecond: 142, timeLimitSeconds: 46, wobbleDeg: 12 },
  HARD: { gateHalfWidthDeg: 15, hitGoal: 6, radiusPx: 112, speedDegPerSecond: 172, timeLimitSeconds: 58, wobbleDeg: 14 },
  EXPERT: { gateHalfWidthDeg: 12, hitGoal: 7, radiusPx: 118, speedDegPerSecond: 208, timeLimitSeconds: 74, wobbleDeg: 18 },
};

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function getAngularDistance(left: number, right: number) {
  const delta = Math.abs(normalizeAngle(left) - normalizeAngle(right));
  return Math.min(delta, 360 - delta);
}

function pickGateAngle(previousAngle: number | null) {
  if (previousAngle === null) {
    return Math.floor(Math.random() * 360);
  }

  let nextAngle = previousAngle;

  while (getAngularDistance(nextAngle, previousAngle) < 68) {
    nextAngle = Math.floor(Math.random() * 360);
  }

  return nextAngle;
}

export function useOrbitTapSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gateAngle, setGateAngle] = useState(18);
  const [hitCount, setHitCount] = useState(0);
  const [markerAngle, setMarkerAngle] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTapAtRef = useRef(0);
  const markerAngleRef = useRef(0);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;
    markerAngleRef.current = 0;
    setElapsedSeconds(0);
    setGateAngle(18);
    setHitCount(0);
    setMarkerAngle(0);
    setMissCount(0);
    setState("idle");
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
      const oscillation = Math.sin(elapsedMs / 340) * config.wobbleDeg;
      const nextMarkerAngle = normalizeAngle((elapsedMs * config.speedDegPerSecond) / 1000 + oscillation);

      markerAngleRef.current = nextMarkerAngle;
      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));
      setMarkerAngle(nextMarkerAngle);

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
    cancelBrowserAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;
    lastTapAtRef.current = 0;
    markerAngleRef.current = 0;
    setElapsedSeconds(0);
    setGateAngle(pickGateAngle(null));
    setHitCount(0);
    setMarkerAngle(0);
    setMissCount(0);
    setState("playing");
  }

  function tapOrbit(): TapResult {
    if (state !== "playing") {
      return "ignored";
    }

    const now = Date.now();

    if (now - lastTapAtRef.current < 120) {
      return "ignored";
    }

    lastTapAtRef.current = now;
    const distance = getAngularDistance(markerAngleRef.current, gateAngle);

    if (distance > config.gateHalfWidthDeg) {
      setMissCount((current) => current + 1);
      return "miss";
    }

    const nextHitCount = hitCount + 1;

    setHitCount(nextHitCount);

    if (nextHitCount >= config.hitGoal) {
      setState("cleared");
      return "hit";
    }

    setGateAngle((current) => pickGateAngle(current));
    return "hit";
  }

  return {
    beginRun,
    elapsedSeconds,
    gateAngle,
    gateHalfWidthDeg: config.gateHalfWidthDeg,
    hitCount,
    hitGoal: config.hitGoal,
    markerAngle,
    missCount,
    radiusPx: config.radiusPx,
    state,
    tapOrbit,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
