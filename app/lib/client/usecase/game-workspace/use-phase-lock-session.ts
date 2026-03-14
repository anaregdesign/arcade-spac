import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type LockResult = "hit" | "ignored" | "miss";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type ActiveWindow = "locked" | "miss" | "target";

type DifficultyConfig = {
  speedRangeDegPerSecond: [number, number];
  targetHalfWidthDeg: number;
  timeLimitSeconds: number;
  wheelCount: number;
};

type PhaseLockWheelDefinition = {
  id: string;
  initialAngle: number;
  speedDegPerSecond: number;
  targetAngle: number;
  wobbleDeg: number;
  wobblePeriodMs: number;
};

export type PhaseLockWheel = {
  currentAngle: number;
  id: string;
  isActive: boolean;
  isLocked: boolean;
  lockedAngle: number | null;
  speedDegPerSecond: number;
  targetAngle: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { speedRangeDegPerSecond: [54, 84], targetHalfWidthDeg: 20, timeLimitSeconds: 40, wheelCount: 2 },
  NORMAL: { speedRangeDegPerSecond: [66, 102], targetHalfWidthDeg: 18, timeLimitSeconds: 50, wheelCount: 3 },
  HARD: { speedRangeDegPerSecond: [78, 122], targetHalfWidthDeg: 16, timeLimitSeconds: 62, wheelCount: 4 },
  EXPERT: { speedRangeDegPerSecond: [92, 144], targetHalfWidthDeg: 14, timeLimitSeconds: 76, wheelCount: 5 },
};

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function getAngularDistance(left: number, right: number) {
  const delta = Math.abs(normalizeAngle(left) - normalizeAngle(right));
  return Math.min(delta, 360 - delta);
}

function randomIntInRange(minInclusive: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function buildWheelDefinitions(config: DifficultyConfig, preview = false): PhaseLockWheelDefinition[] {
  return Array.from({ length: config.wheelCount }, (_, index) => {
    if (preview) {
      return {
        id: `phase-lock-preview-${index}`,
        initialAngle: normalizeAngle(300 - index * 74),
        speedDegPerSecond: 56 + index * 18,
        targetAngle: normalizeAngle(32 + index * 84),
        wobbleDeg: 4 + index * 2,
        wobblePeriodMs: 620 + index * 80,
      };
    }

    const speed = randomIntInRange(config.speedRangeDegPerSecond[0], config.speedRangeDegPerSecond[1]);
    const signedSpeed = index % 2 === 0 ? speed : -speed;
    let targetAngle = Math.floor(Math.random() * 360);
    let initialAngle = targetAngle;

    while (getAngularDistance(initialAngle, targetAngle) < 42) {
      initialAngle = Math.floor(Math.random() * 360);
    }

    return {
      id: `phase-lock-live-${index}`,
      initialAngle,
      speedDegPerSecond: signedSpeed,
      targetAngle,
      wobbleDeg: randomIntInRange(4, 10),
      wobblePeriodMs: randomIntInRange(520, 880),
    };
  });
}

function computeWheelAngles(
  wheelDefinitions: PhaseLockWheelDefinition[],
  lockedAngles: Array<number | null>,
  elapsedMs: number,
) {
  return wheelDefinitions.map((wheel, index) => {
    if (lockedAngles[index] !== null) {
      return lockedAngles[index] ?? wheel.initialAngle;
    }

    const oscillation = Math.sin((elapsedMs + index * 120) / wheel.wobblePeriodMs) * wheel.wobbleDeg;

    return normalizeAngle(wheel.initialAngle + (elapsedMs * wheel.speedDegPerSecond) / 1000 + oscillation);
  });
}

function findNextActiveWheelIndex(lockedAngles: Array<number | null>) {
  return lockedAngles.findIndex((value) => value === null);
}

export function usePhaseLockSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewWheelDefinitions = useMemo(() => buildWheelDefinitions(config, true), [config]);
  const [wheelDefinitions, setWheelDefinitions] = useState<PhaseLockWheelDefinition[]>(previewWheelDefinitions);
  const [wheelAngles, setWheelAngles] = useState<number[]>(() => computeWheelAngles(previewWheelDefinitions, Array.from({ length: config.wheelCount }, () => null), 0));
  const [lockedAngles, setLockedAngles] = useState<Array<number | null>>(() => Array.from({ length: config.wheelCount }, () => null));
  const [currentWheelIndex, setCurrentWheelIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastLockResult, setLastLockResult] = useState<LockResult | null>(null);
  const [state, setState] = useState<SessionState>("idle");
  const [timingErrorCount, setTimingErrorCount] = useState(0);

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const currentWheelIndexRef = useRef(0);
  const lastTapAtRef = useRef(0);
  const lockedAnglesRef = useRef<Array<number | null>>(Array.from({ length: config.wheelCount }, () => null));
  const startTimeRef = useRef<number | null>(null);
  const wheelAnglesRef = useRef<number[]>(wheelAngles);
  const wheelDefinitionsRef = useRef<PhaseLockWheelDefinition[]>(previewWheelDefinitions);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    const nextLockedAngles = Array.from({ length: config.wheelCount }, () => null);
    const nextWheelAngles = computeWheelAngles(previewWheelDefinitions, nextLockedAngles, 0);

    currentWheelIndexRef.current = 0;
    lastTapAtRef.current = 0;
    lockedAnglesRef.current = nextLockedAngles;
    startTimeRef.current = null;
    wheelAnglesRef.current = nextWheelAngles;
    wheelDefinitionsRef.current = previewWheelDefinitions;

    setCurrentWheelIndex(0);
    setElapsedSeconds(0);
    setLastLockResult(null);
    setLockedAngles(nextLockedAngles);
    setState("idle");
    setTimingErrorCount(0);
    setWheelAngles(nextWheelAngles);
    setWheelDefinitions(previewWheelDefinitions);
  }, [config, previewWheelDefinitions]);

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
      const nextWheelAngles = computeWheelAngles(wheelDefinitionsRef.current, lockedAnglesRef.current, elapsedMs);

      wheelAnglesRef.current = nextWheelAngles;
      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));
      setWheelAngles(nextWheelAngles);

      if (elapsedMs >= config.timeLimitSeconds * 1000) {
        setElapsedSeconds(config.timeLimitSeconds);
        setState((current) => (current === "playing" ? "failed" : current));
        return;
      }

      animationFrameRef.current = requestBrowserAnimationFrame(loop);
    };

    animationFrameRef.current = requestBrowserAnimationFrame(loop);

    return () => cancelBrowserAnimationFrame(animationFrameRef.current);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    const nextWheelDefinitions = buildWheelDefinitions(config);
    const nextLockedAngles = Array.from({ length: config.wheelCount }, () => null);
    const nextWheelAngles = computeWheelAngles(nextWheelDefinitions, nextLockedAngles, 0);

    cancelBrowserAnimationFrame(animationFrameRef.current);
    currentWheelIndexRef.current = 0;
    lastTapAtRef.current = 0;
    lockedAnglesRef.current = nextLockedAngles;
    startTimeRef.current = null;
    wheelAnglesRef.current = nextWheelAngles;
    wheelDefinitionsRef.current = nextWheelDefinitions;

    setCurrentWheelIndex(0);
    setElapsedSeconds(0);
    setLastLockResult(null);
    setLockedAngles(nextLockedAngles);
    setState("playing");
    setTimingErrorCount(0);
    setWheelAngles(nextWheelAngles);
    setWheelDefinitions(nextWheelDefinitions);
  }

  function lockCurrentWheel(): LockResult {
    if (state !== "playing") {
      return "ignored";
    }

    const now = Date.now();

    if (now - lastTapAtRef.current < 120) {
      return "ignored";
    }

    lastTapAtRef.current = now;
    const targetIndex = currentWheelIndexRef.current;
    const activeWheel = wheelDefinitionsRef.current[targetIndex];

    if (!activeWheel) {
      return "ignored";
    }

    const currentAngle = wheelAnglesRef.current[targetIndex] ?? activeWheel.initialAngle;
    const distance = getAngularDistance(currentAngle, activeWheel.targetAngle);

    if (distance > config.targetHalfWidthDeg) {
      setLastLockResult("miss");
      setTimingErrorCount((current) => current + 1);
      return "miss";
    }

    const nextLockedAngles = [...lockedAnglesRef.current];
    nextLockedAngles[targetIndex] = currentAngle;
    lockedAnglesRef.current = nextLockedAngles;
    setLockedAngles(nextLockedAngles);
    setLastLockResult("hit");

    const nextActiveIndex = findNextActiveWheelIndex(nextLockedAngles);

    if (nextActiveIndex === -1) {
      currentWheelIndexRef.current = wheelDefinitionsRef.current.length;
      setCurrentWheelIndex(wheelDefinitionsRef.current.length);
      setState("cleared");
      return "hit";
    }

    currentWheelIndexRef.current = nextActiveIndex;
    setCurrentWheelIndex(nextActiveIndex);
    return "hit";
  }

  const wheels: PhaseLockWheel[] = wheelDefinitions.map((wheel, index) => ({
    currentAngle: wheelAngles[index] ?? wheel.initialAngle,
    id: wheel.id,
    isActive: state === "playing" && index === currentWheelIndex,
    isLocked: lockedAngles[index] !== null,
    lockedAngle: lockedAngles[index],
    speedDegPerSecond: wheel.speedDegPerSecond,
    targetAngle: wheel.targetAngle,
  }));
  const lockedWheelCount = lockedAngles.filter((value) => value !== null).length;
  const accuracyPercent = lockedWheelCount + timingErrorCount === 0
    ? 100
    : Math.round((lockedWheelCount / (lockedWheelCount + timingErrorCount)) * 100);
  const activeWheel = wheels[currentWheelIndex] ?? null;
  const activeWindow: ActiveWindow = state !== "playing" || !activeWheel
    ? "locked"
    : getAngularDistance(activeWheel.currentAngle, activeWheel.targetAngle) <= config.targetHalfWidthDeg
      ? "target"
      : "miss";

  return {
    accuracyPercent,
    activeWindow,
    beginRun,
    currentWheelIndex,
    elapsedSeconds,
    lastLockResult,
    lockCurrentWheel,
    lockedWheelCount,
    state,
    targetHalfWidthDeg: config.targetHalfWidthDeg,
    timeLimitSeconds: config.timeLimitSeconds,
    timingErrorCount,
    wheelCount: config.wheelCount,
    wheels,
  };
}
