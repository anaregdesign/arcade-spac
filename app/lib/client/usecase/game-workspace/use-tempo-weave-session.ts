import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type LaneId = "left" | "right";
type LaneTheme = "rose" | "sky";
type LaneWindow = "good" | "miss" | "perfect";
type TapResult = LaneWindow | "ignored";

type LaneDefinition = {
  baseCycleMs: number;
  id: LaneId;
  label: string;
  previewPhase: number;
  startPhase: number;
  theme: LaneTheme;
};

type DifficultyConfig = {
  densityScalePerLevel: number;
  goodWindowNormalized: number;
  laneGoal: number;
  lanes: [LaneDefinition, LaneDefinition];
  maxDensityLevel: number;
  perfectWindowNormalized: number;
  startLeadInMs: number;
  streakStep: number;
  timeLimitSeconds: number;
};

type LaneRuntime = {
  baseCycleMs: number;
  currentCycleMs: number;
  currentWindow: LaneWindow;
  cycleStartedAtMs: number | null;
  hitCount: number;
  id: LaneId;
  isCompleted: boolean;
  label: string;
  lastJudgment: LaneWindow | null;
  missCount: number;
  perfectHitCount: number;
  phase: number;
  targetHitCount: number;
  theme: LaneTheme;
};

type LaneSnapshot = {
  accuracyPercent: number;
  currentCycleMs: number;
  currentWindow: LaneWindow;
  hitCount: number;
  id: LaneId;
  isCompleted: boolean;
  label: string;
  lastJudgment: LaneWindow | null;
  markerPercent: number;
  missCount: number;
  perfectHitCount: number;
  phase: number;
  targetHitCount: number;
  theme: LaneTheme;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    densityScalePerLevel: 0.08,
    goodWindowNormalized: 0.12,
    laneGoal: 4,
    lanes: [
      { baseCycleMs: 1020, id: "left", label: "Left lane", previewPhase: 0.24, startPhase: 0.16, theme: "sky" },
      { baseCycleMs: 820, id: "right", label: "Right lane", previewPhase: 0.62, startPhase: 0.34, theme: "rose" },
    ],
    maxDensityLevel: 3,
    perfectWindowNormalized: 0.05,
    startLeadInMs: 420,
    streakStep: 3,
    timeLimitSeconds: 42,
  },
  NORMAL: {
    densityScalePerLevel: 0.085,
    goodWindowNormalized: 0.105,
    laneGoal: 5,
    lanes: [
      { baseCycleMs: 960, id: "left", label: "Left lane", previewPhase: 0.26, startPhase: 0.18, theme: "sky" },
      { baseCycleMs: 760, id: "right", label: "Right lane", previewPhase: 0.64, startPhase: 0.36, theme: "rose" },
    ],
    maxDensityLevel: 4,
    perfectWindowNormalized: 0.045,
    startLeadInMs: 380,
    streakStep: 3,
    timeLimitSeconds: 50,
  },
  HARD: {
    densityScalePerLevel: 0.09,
    goodWindowNormalized: 0.095,
    laneGoal: 6,
    lanes: [
      { baseCycleMs: 900, id: "left", label: "Left lane", previewPhase: 0.28, startPhase: 0.2, theme: "sky" },
      { baseCycleMs: 700, id: "right", label: "Right lane", previewPhase: 0.66, startPhase: 0.38, theme: "rose" },
    ],
    maxDensityLevel: 4,
    perfectWindowNormalized: 0.04,
    startLeadInMs: 340,
    streakStep: 3,
    timeLimitSeconds: 62,
  },
  EXPERT: {
    densityScalePerLevel: 0.095,
    goodWindowNormalized: 0.085,
    laneGoal: 7,
    lanes: [
      { baseCycleMs: 860, id: "left", label: "Left lane", previewPhase: 0.3, startPhase: 0.22, theme: "sky" },
      { baseCycleMs: 660, id: "right", label: "Right lane", previewPhase: 0.68, startPhase: 0.4, theme: "rose" },
    ],
    maxDensityLevel: 5,
    perfectWindowNormalized: 0.036,
    startLeadInMs: 320,
    streakStep: 3,
    timeLimitSeconds: 76,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLaneWindow(phase: number, perfectWindowNormalized: number, goodWindowNormalized: number): LaneWindow {
  const delta = Math.abs(phase - 0.5);

  if (delta <= perfectWindowNormalized) {
    return "perfect";
  }

  if (delta <= goodWindowNormalized) {
    return "good";
  }

  return "miss";
}

function getCycleDurationMs(baseCycleMs: number, densityLevel: number, config: Pick<DifficultyConfig, "densityScalePerLevel">) {
  const scaled = baseCycleMs * (1 - densityLevel * config.densityScalePerLevel);

  return Math.max(420, Math.round(scaled));
}

function toAccuracyPercent(hitCount: number, missCount: number) {
  const totalAttemptCount = hitCount + missCount;

  if (totalAttemptCount === 0) {
    return 100;
  }

  return Math.round((hitCount / totalAttemptCount) * 100);
}

function toLaneSnapshot(lane: LaneRuntime): LaneSnapshot {
  return {
    accuracyPercent: toAccuracyPercent(lane.hitCount, lane.missCount),
    currentCycleMs: lane.currentCycleMs,
    currentWindow: lane.currentWindow,
    hitCount: lane.hitCount,
    id: lane.id,
    isCompleted: lane.isCompleted,
    label: lane.label,
    lastJudgment: lane.lastJudgment,
    markerPercent: Math.round(clamp(lane.phase, 0, 1) * 100),
    missCount: lane.missCount,
    perfectHitCount: lane.perfectHitCount,
    phase: lane.phase,
    targetHitCount: lane.targetHitCount,
    theme: lane.theme,
  };
}

function cloneLaneRuntime(lane: LaneRuntime): LaneRuntime {
  return { ...lane };
}

function cloneLaneRuntimes(lanes: LaneRuntime[]) {
  return lanes.map(cloneLaneRuntime);
}

function buildPreviewLanes(config: DifficultyConfig) {
  return config.lanes.map((lane) => ({
    baseCycleMs: lane.baseCycleMs,
    currentCycleMs: lane.baseCycleMs,
    currentWindow: getLaneWindow(lane.previewPhase, config.perfectWindowNormalized, config.goodWindowNormalized),
    cycleStartedAtMs: null,
    hitCount: 0,
    id: lane.id,
    isCompleted: false,
    label: lane.label,
    lastJudgment: null,
    missCount: 0,
    perfectHitCount: 0,
    phase: lane.previewPhase,
    targetHitCount: config.laneGoal,
    theme: lane.theme,
  }));
}

function buildLiveLanes(config: DifficultyConfig, timestamp: number) {
  return config.lanes.map((lane) => {
    const currentCycleMs = getCycleDurationMs(lane.baseCycleMs, 0, config);

    return {
      baseCycleMs: lane.baseCycleMs,
      currentCycleMs,
      currentWindow: getLaneWindow(lane.startPhase, config.perfectWindowNormalized, config.goodWindowNormalized),
      cycleStartedAtMs: timestamp + config.startLeadInMs - currentCycleMs * lane.startPhase,
      hitCount: 0,
      id: lane.id,
      isCompleted: false,
      label: lane.label,
      lastJudgment: null,
      missCount: 0,
      perfectHitCount: 0,
      phase: lane.startPhase,
      targetHitCount: config.laneGoal,
      theme: lane.theme,
    };
  });
}

function updateLaneForTimestamp(lane: LaneRuntime, config: DifficultyConfig, timestamp: number) {
  if (lane.isCompleted || lane.cycleStartedAtMs === null) {
    return lane;
  }

  const phase = (timestamp - lane.cycleStartedAtMs) / lane.currentCycleMs;

  return {
    ...lane,
    currentWindow: getLaneWindow(phase, config.perfectWindowNormalized, config.goodWindowNormalized),
    phase,
  };
}

function completeLane(lane: LaneRuntime, judgment: "good" | "perfect") {
  return {
    ...lane,
    currentWindow: "perfect" as const,
    cycleStartedAtMs: null,
    isCompleted: true,
    lastJudgment: judgment,
    phase: 0.5,
  };
}

function restartLaneCycle(lane: LaneRuntime, densityLevel: number, config: DifficultyConfig, timestamp: number) {
  const currentCycleMs = getCycleDurationMs(lane.baseCycleMs, densityLevel, config);

  return {
    ...lane,
    currentCycleMs,
    currentWindow: getLaneWindow(0, config.perfectWindowNormalized, config.goodWindowNormalized),
    cycleStartedAtMs: timestamp,
    phase: 0,
  };
}

export function useTempoWeaveSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewLanes = useMemo(() => buildPreviewLanes(config), [config]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [densityLevel, setDensityLevel] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lanes, setLanes] = useState<LaneSnapshot[]>(previewLanes.map(toLaneSnapshot));
  const [lastJudgment, setLastJudgment] = useState<LaneWindow | null>(null);
  const [lastLaneId, setLastLaneId] = useState<LaneId | null>(null);
  const [state, setState] = useState<SessionState>("idle");

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const bestStreakRef = useRef(0);
  const currentStreakRef = useRef(0);
  const densityLevelRef = useRef(0);
  const laneRuntimesRef = useRef<LaneRuntime[]>(cloneLaneRuntimes(previewLanes));
  const runStartTimeRef = useRef<number | null>(null);

  const missThresholdNormalized = 0.5 + config.goodWindowNormalized;

  function syncLaneSnapshots(nextLaneRuntimes: LaneRuntime[]) {
    laneRuntimesRef.current = nextLaneRuntimes;
    setLanes(nextLaneRuntimes.map(toLaneSnapshot));
  }

  function resetSession() {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    bestStreakRef.current = 0;
    currentStreakRef.current = 0;
    densityLevelRef.current = 0;
    laneRuntimesRef.current = cloneLaneRuntimes(previewLanes);
    runStartTimeRef.current = null;

    setBestStreak(0);
    setCurrentStreak(0);
    setDensityLevel(0);
    setElapsedSeconds(0);
    setLanes(previewLanes.map(toLaneSnapshot));
    setLastJudgment(null);
    setLastLaneId(null);
    setState("idle");
  }

  function applyMiss(nextLaneRuntimes: LaneRuntime[], laneId: LaneId, timestamp: number) {
    currentStreakRef.current = 0;
    densityLevelRef.current = 0;

    setCurrentStreak(0);
    setDensityLevel(0);
    setLastJudgment("miss");
    setLastLaneId(laneId);

    return nextLaneRuntimes.map((lane) => {
      if (lane.id !== laneId || lane.isCompleted) {
        return lane;
      }

      return restartLaneCycle(
        {
          ...lane,
          lastJudgment: "miss",
          missCount: lane.missCount + 1,
        },
        0,
        config,
        timestamp,
      );
    });
  }

  function applyHit(nextLaneRuntimes: LaneRuntime[], laneId: LaneId, judgment: "good" | "perfect", timestamp: number) {
    const nextCurrentStreak = currentStreakRef.current + 1;
    const nextBestStreak = Math.max(bestStreakRef.current, nextCurrentStreak);
    const nextDensityLevel = Math.min(config.maxDensityLevel, Math.floor(nextCurrentStreak / config.streakStep));

    currentStreakRef.current = nextCurrentStreak;
    bestStreakRef.current = nextBestStreak;
    densityLevelRef.current = nextDensityLevel;

    setCurrentStreak(nextCurrentStreak);
    setBestStreak(nextBestStreak);
    setDensityLevel(nextDensityLevel);
    setLastJudgment(judgment);
    setLastLaneId(laneId);

    return nextLaneRuntimes.map((lane) => {
      if (lane.id !== laneId || lane.isCompleted) {
        return lane;
      }

      const nextHitCount = lane.hitCount + 1;
      const nextPerfectHitCount = judgment === "perfect" ? lane.perfectHitCount + 1 : lane.perfectHitCount;
      const updatedLane = {
        ...lane,
        hitCount: nextHitCount,
        lastJudgment: judgment,
        perfectHitCount: nextPerfectHitCount,
      };

      if (nextHitCount >= lane.targetHitCount) {
        return completeLane(updatedLane, judgment);
      }

      return restartLaneCycle(updatedLane, nextDensityLevel, config, timestamp);
    });
  }

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config, previewLanes]);

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
      const nextElapsedSeconds = Math.min(config.timeLimitSeconds, Math.floor(runElapsedMs / 1000));
      const updatedLanes = laneRuntimesRef.current.map((lane) => updateLaneForTimestamp(lane, config, timestamp));
      const overdueLaneIds = updatedLanes
        .filter((lane) => !lane.isCompleted && lane.phase > missThresholdNormalized)
        .map((lane) => lane.id);

      setElapsedSeconds((current) => (current === nextElapsedSeconds ? current : nextElapsedSeconds));

      let nextLaneRuntimes = updatedLanes;

      for (const laneId of overdueLaneIds) {
        nextLaneRuntimes = applyMiss(nextLaneRuntimes, laneId, timestamp);
      }

      syncLaneSnapshots(nextLaneRuntimes);

      if (nextLaneRuntimes.every((lane) => lane.isCompleted)) {
        setState("cleared");
        return;
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
  }, [config, missThresholdNormalized, state]);

  function beginRun() {
    const timestamp = performance.now();
    const liveLanes = buildLiveLanes(config, timestamp);

    cancelBrowserAnimationFrame(animationFrameRef.current);
    bestStreakRef.current = 0;
    currentStreakRef.current = 0;
    densityLevelRef.current = 0;
    laneRuntimesRef.current = cloneLaneRuntimes(liveLanes);
    runStartTimeRef.current = null;

    setBestStreak(0);
    setCurrentStreak(0);
    setDensityLevel(0);
    setElapsedSeconds(0);
    setLastJudgment(null);
    setLastLaneId(null);
    setLanes(liveLanes.map(toLaneSnapshot));
    setState("playing");
  }

  function tapLane(laneId: LaneId): TapResult {
    if (state !== "playing") {
      return "ignored";
    }

    const timestamp = performance.now();
    const updatedLanes = laneRuntimesRef.current.map((lane) => updateLaneForTimestamp(lane, config, timestamp));
    const targetLane = updatedLanes.find((lane) => lane.id === laneId);

    if (!targetLane || targetLane.isCompleted) {
      return "ignored";
    }

    let nextLaneRuntimes =
      targetLane.currentWindow === "perfect" || targetLane.currentWindow === "good"
        ? applyHit(updatedLanes, laneId, targetLane.currentWindow, timestamp)
        : applyMiss(updatedLanes, laneId, timestamp);

    syncLaneSnapshots(nextLaneRuntimes);

    if (nextLaneRuntimes.every((lane) => lane.isCompleted)) {
      setState("cleared");
    }

    return targetLane.currentWindow;
  }

  const missCount = lanes.reduce((count, lane) => count + lane.missCount, 0);
  const perfectHitCount = lanes.reduce((count, lane) => count + lane.perfectHitCount, 0);
  const completedLaneCount = lanes.reduce((count, lane) => count + (lane.isCompleted ? 1 : 0), 0);
  const totalHitCount = lanes.reduce((count, lane) => count + lane.hitCount, 0);
  const totalTargetCount = lanes.reduce((count, lane) => count + lane.targetHitCount, 0);

  return {
    beginRun,
    bestStreak,
    completedLaneCount,
    currentStreak,
    densityLevel,
    elapsedSeconds,
    goodWindowNormalized: config.goodWindowNormalized,
    laneGoal: config.laneGoal,
    lanes,
    lastJudgment,
    lastLaneId,
    missCount,
    perfectHitCount,
    perfectWindowNormalized: config.perfectWindowNormalized,
    state,
    tapLane,
    timeLimitSeconds: config.timeLimitSeconds,
    totalHitCount,
    totalTargetCount,
  };
}
