import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type CycleWindow = "good" | "miss" | "perfect";
type GlowCycleJudgment = CycleWindow | "wrong-node";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type TapResult = GlowCycleJudgment | "ignored";
type NodeTheme = "amber" | "cyan" | "lime" | "pink" | "violet" | "sky";

type DifficultyConfig = {
  cycleDurationRangeMs: [number, number];
  cycleGoal: number;
  goodSpreadNormalized: number;
  nodeCount: number;
  perfectSpreadNormalized: number;
  periodRangeMs: [number, number];
  timeLimitSeconds: number;
};

type GlowCycleNodeDefinition = {
  id: string;
  label: string;
  periodMs: number;
  phaseOffsetNormalized: number;
  theme: NodeTheme;
};

type GlowCycleDefinition = {
  cycleDurationMs: number;
  nodes: GlowCycleNodeDefinition[];
  syncLeadMs: number;
  targetNodeIndex: number;
};

export type GlowCycleNodeSnapshot = {
  brightnessPercent: number;
  id: string;
  isTarget: boolean;
  label: string;
  periodMs: number;
  phasePercent: number;
  theme: NodeTheme;
};

type GlowCycleFrame = {
  cycleProgressPercent: number;
  nodes: GlowCycleNodeSnapshot[];
  syncProgressPercent: number;
  window: CycleWindow;
  windowSpreadPercent: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    cycleDurationRangeMs: [2280, 2620],
    cycleGoal: 4,
    goodSpreadNormalized: 0.108,
    nodeCount: 4,
    perfectSpreadNormalized: 0.056,
    periodRangeMs: [620, 980],
    timeLimitSeconds: 42,
  },
  NORMAL: {
    cycleDurationRangeMs: [2360, 2860],
    cycleGoal: 5,
    goodSpreadNormalized: 0.096,
    nodeCount: 4,
    perfectSpreadNormalized: 0.05,
    periodRangeMs: [580, 1040],
    timeLimitSeconds: 50,
  },
  HARD: {
    cycleDurationRangeMs: [2480, 3080],
    cycleGoal: 6,
    goodSpreadNormalized: 0.088,
    nodeCount: 5,
    perfectSpreadNormalized: 0.045,
    periodRangeMs: [540, 1120],
    timeLimitSeconds: 62,
  },
  EXPERT: {
    cycleDurationRangeMs: [2580, 3280],
    cycleGoal: 7,
    goodSpreadNormalized: 0.082,
    nodeCount: 6,
    perfectSpreadNormalized: 0.04,
    periodRangeMs: [520, 1180],
    timeLimitSeconds: 76,
  },
};

const nodeThemes: NodeTheme[] = ["cyan", "amber", "pink", "lime", "violet", "sky"];
const nodeLabels = ["Node A", "Node B", "Node C", "Node D", "Node E", "Node F"];

function normalizeUnit(value: number) {
  return ((value % 1) + 1) % 1;
}

function nowInMs() {
  if (typeof performance !== "undefined") {
    return performance.now();
  }

  return Date.now();
}

function getGlowStrengthPercent(phaseNormalized: number) {
  const wave = (Math.cos(normalizeUnit(phaseNormalized) * Math.PI * 2) + 1) / 2;

  return 18 + Math.round(Math.pow(wave, 1.45) * 82);
}

function getPhaseDistanceNormalized(phaseNormalized: number) {
  const normalizedPhase = normalizeUnit(phaseNormalized);

  return Math.min(normalizedPhase, 1 - normalizedPhase);
}

function getCycleWindow(
  spreadNormalized: number,
  perfectSpreadNormalized: number,
  goodSpreadNormalized: number,
): CycleWindow {
  if (spreadNormalized <= perfectSpreadNormalized) {
    return "perfect";
  }

  if (spreadNormalized <= goodSpreadNormalized) {
    return "good";
  }

  return "miss";
}

function buildCycleDefinition(config: DifficultyConfig, cycleIndex: number, preview = false): GlowCycleDefinition {
  const cycleDurationSpan = config.cycleDurationRangeMs[1] - config.cycleDurationRangeMs[0];
  const periodSpan = config.periodRangeMs[1] - config.periodRangeMs[0];
  const cycleDurationMs = config.cycleDurationRangeMs[0] + ((cycleIndex * 173 + (preview ? 41 : 0)) % (cycleDurationSpan + 1));
  const syncLeadRatio = 0.48 + ((cycleIndex + (preview ? 1 : 0)) % 4) * 0.06;
  const syncLeadMs = Math.round(cycleDurationMs * syncLeadRatio);

  return {
    cycleDurationMs,
    nodes: Array.from({ length: config.nodeCount }, (_, nodeIndex) => {
      const periodMs = config.periodRangeMs[0] + ((cycleIndex * 131 + nodeIndex * 97 + (preview ? 53 : 0)) % (periodSpan + 1));

      return {
        id: `glow-cycle-node-${nodeIndex}`,
        label: nodeLabels[nodeIndex] ?? `Node ${nodeIndex + 1}`,
        periodMs,
        phaseOffsetNormalized: normalizeUnit(-(syncLeadMs / periodMs)),
        theme: nodeThemes[(cycleIndex + nodeIndex) % nodeThemes.length] ?? "cyan",
      };
    }),
    syncLeadMs,
    targetNodeIndex: (cycleIndex * 2 + (preview ? 1 : 0)) % config.nodeCount,
  };
}

function buildCycleFrame(
  definition: GlowCycleDefinition,
  elapsedMs: number,
  config: DifficultyConfig,
): GlowCycleFrame {
  const elapsedWithinCycle = normalizeUnit(elapsedMs / definition.cycleDurationMs) * definition.cycleDurationMs;
  const distances: number[] = [];
  const nodes = definition.nodes.map((node, nodeIndex) => {
    const phaseNormalized = normalizeUnit(elapsedWithinCycle / node.periodMs + node.phaseOffsetNormalized);
    const distanceNormalized = getPhaseDistanceNormalized(phaseNormalized);

    distances.push(distanceNormalized);

    return {
      brightnessPercent: getGlowStrengthPercent(phaseNormalized),
      id: node.id,
      isTarget: nodeIndex === definition.targetNodeIndex,
      label: node.label,
      periodMs: node.periodMs,
      phasePercent: Math.round(phaseNormalized * 100),
      theme: node.theme,
    };
  });
  const spreadNormalized = distances.length > 0 ? Math.max(...distances) : 1;

  return {
    cycleProgressPercent: Math.round((elapsedWithinCycle / definition.cycleDurationMs) * 100),
    nodes,
    syncProgressPercent: Math.round((definition.syncLeadMs / definition.cycleDurationMs) * 100),
    window: getCycleWindow(
      spreadNormalized,
      config.perfectSpreadNormalized,
      config.goodSpreadNormalized,
    ),
    windowSpreadPercent: Math.round(spreadNormalized * 100),
  };
}

export function useGlowCycleSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewDefinition = useMemo(() => buildCycleDefinition(config, 0, true), [config]);
  const previewFrame = useMemo(
    () => buildCycleFrame(previewDefinition, Math.round(previewDefinition.cycleDurationMs * 0.34), config),
    [config, previewDefinition],
  );
  const [clearedCycleCount, setClearedCycleCount] = useState(0);
  const [cycleProgressPercent, setCycleProgressPercent] = useState(previewFrame.cycleProgressPercent);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastJudgment, setLastJudgment] = useState<GlowCycleJudgment | null>(null);
  const [mistimedTapCount, setMistimedTapCount] = useState(0);
  const [nodes, setNodes] = useState<GlowCycleNodeSnapshot[]>(previewFrame.nodes);
  const [perfectCycleCount, setPerfectCycleCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [syncProgressPercent, setSyncProgressPercent] = useState(previewFrame.syncProgressPercent);
  const [window, setWindow] = useState<CycleWindow>(previewFrame.window);
  const [windowSpreadPercent, setWindowSpreadPercent] = useState(previewFrame.windowSpreadPercent);

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const clearedCycleCountRef = useRef(0);
  const cycleDefinitionRef = useRef(previewDefinition);
  const cycleStartTimeRef = useRef<number | null>(null);
  const lastTapAtRef = useRef(0);
  const mistimedTapCountRef = useRef(0);
  const perfectCycleCountRef = useRef(0);
  const runStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    clearedCycleCountRef.current = 0;
    cycleDefinitionRef.current = previewDefinition;
    cycleStartTimeRef.current = null;
    lastTapAtRef.current = 0;
    mistimedTapCountRef.current = 0;
    perfectCycleCountRef.current = 0;
    runStartTimeRef.current = null;

    setClearedCycleCount(0);
    setCycleProgressPercent(previewFrame.cycleProgressPercent);
    setElapsedSeconds(0);
    setLastJudgment(null);
    setMistimedTapCount(0);
    setNodes(previewFrame.nodes);
    setPerfectCycleCount(0);
    setState("idle");
    setSyncProgressPercent(previewFrame.syncProgressPercent);
    setWindow(previewFrame.window);
    setWindowSpreadPercent(previewFrame.windowSpreadPercent);
  }, [
    previewDefinition,
    previewFrame.cycleProgressPercent,
    previewFrame.nodes,
    previewFrame.syncProgressPercent,
    previewFrame.window,
    previewFrame.windowSpreadPercent,
  ]);

  useEffect(() => {
    if (state !== "playing") {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (runStartTimeRef.current === null) {
        runStartTimeRef.current = timestamp;
      }

      if (cycleStartTimeRef.current === null) {
        cycleStartTimeRef.current = timestamp;
      }

      const runElapsedMs = timestamp - runStartTimeRef.current;
      const cycleElapsedMs = timestamp - cycleStartTimeRef.current;
      const nextFrame = buildCycleFrame(cycleDefinitionRef.current, cycleElapsedMs, config);
      const elapsed = Math.min(config.timeLimitSeconds, Math.floor(runElapsedMs / 1000));

      setCycleProgressPercent(nextFrame.cycleProgressPercent);
      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));
      setNodes(nextFrame.nodes);
      setSyncProgressPercent(nextFrame.syncProgressPercent);
      setWindow(nextFrame.window);
      setWindowSpreadPercent(nextFrame.windowSpreadPercent);

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

  function resetToFrame(
    definition: GlowCycleDefinition,
    nextFrame: GlowCycleFrame,
    nextState: SessionState,
    nextClearedCycleCount: number,
    nextPerfectCycleCount: number,
    nextMistimedTapCount: number,
    nextElapsedSeconds: number,
    nextJudgment: GlowCycleJudgment | null,
    cycleStartTime: number | null,
    runStartTime: number | null,
  ) {
    cycleDefinitionRef.current = definition;
    cycleStartTimeRef.current = cycleStartTime;
    runStartTimeRef.current = runStartTime;
    clearedCycleCountRef.current = nextClearedCycleCount;
    mistimedTapCountRef.current = nextMistimedTapCount;
    perfectCycleCountRef.current = nextPerfectCycleCount;

    setClearedCycleCount(nextClearedCycleCount);
    setCycleProgressPercent(nextFrame.cycleProgressPercent);
    setElapsedSeconds(nextElapsedSeconds);
    setLastJudgment(nextJudgment);
    setMistimedTapCount(nextMistimedTapCount);
    setNodes(nextFrame.nodes);
    setPerfectCycleCount(nextPerfectCycleCount);
    setState(nextState);
    setSyncProgressPercent(nextFrame.syncProgressPercent);
    setWindow(nextFrame.window);
    setWindowSpreadPercent(nextFrame.windowSpreadPercent);
  }

  function beginRun() {
    const cycleDefinition = buildCycleDefinition(config, 0);
    const firstFrame = buildCycleFrame(cycleDefinition, 0, config);
    const currentTime = nowInMs();

    cancelBrowserAnimationFrame(animationFrameRef.current);
    lastTapAtRef.current = 0;

    resetToFrame(cycleDefinition, firstFrame, "playing", 0, 0, 0, 0, null, currentTime, currentTime);
  }

  function tapNode(nodeId: string): TapResult {
    if (state !== "playing") {
      return "ignored";
    }

    const currentTime = nowInMs();

    if (currentTime - lastTapAtRef.current < 120) {
      return "ignored";
    }

    lastTapAtRef.current = currentTime;
    const cycleStartTime = cycleStartTimeRef.current ?? currentTime;
    const frame = buildCycleFrame(cycleDefinitionRef.current, currentTime - cycleStartTime, config);
    const targetNode = frame.nodes.find((node) => node.isTarget) ?? null;
    const liveElapsedSeconds =
      runStartTimeRef.current === null
        ? 0
        : Math.min(config.timeLimitSeconds, Math.floor((currentTime - runStartTimeRef.current) / 1000));

    if (!targetNode || nodeId !== targetNode.id) {
      const nextMistimedTapCount = mistimedTapCountRef.current + 1;

      mistimedTapCountRef.current = nextMistimedTapCount;
      setCycleProgressPercent(frame.cycleProgressPercent);
      setNodes(frame.nodes);
      setSyncProgressPercent(frame.syncProgressPercent);
      setWindow(frame.window);
      setWindowSpreadPercent(frame.windowSpreadPercent);
      setLastJudgment("wrong-node");
      setMistimedTapCount(nextMistimedTapCount);
      return "wrong-node";
    }

    if (frame.window === "miss") {
      const nextMistimedTapCount = mistimedTapCountRef.current + 1;

      mistimedTapCountRef.current = nextMistimedTapCount;
      setCycleProgressPercent(frame.cycleProgressPercent);
      setNodes(frame.nodes);
      setSyncProgressPercent(frame.syncProgressPercent);
      setWindow(frame.window);
      setWindowSpreadPercent(frame.windowSpreadPercent);
      setLastJudgment("miss");
      setMistimedTapCount(nextMistimedTapCount);
      return "miss";
    }

    const nextClearedCycleCount = clearedCycleCountRef.current + 1;
    const nextPerfectCycleCount =
      frame.window === "perfect" ? perfectCycleCountRef.current + 1 : perfectCycleCountRef.current;

    if (nextClearedCycleCount >= config.cycleGoal) {
      clearedCycleCountRef.current = nextClearedCycleCount;
      perfectCycleCountRef.current = nextPerfectCycleCount;

      setClearedCycleCount(nextClearedCycleCount);
      setCycleProgressPercent(frame.cycleProgressPercent);
      setElapsedSeconds(liveElapsedSeconds);
      setLastJudgment(frame.window);
      setNodes(frame.nodes);
      setPerfectCycleCount(nextPerfectCycleCount);
      setState("cleared");
      setSyncProgressPercent(frame.syncProgressPercent);
      setWindow(frame.window);
      setWindowSpreadPercent(frame.windowSpreadPercent);
      return frame.window;
    }

    const nextCycleDefinition = buildCycleDefinition(config, nextClearedCycleCount);
    const nextFrame = buildCycleFrame(nextCycleDefinition, 0, config);

    resetToFrame(
      nextCycleDefinition,
      nextFrame,
      "playing",
      nextClearedCycleCount,
      nextPerfectCycleCount,
      mistimedTapCountRef.current,
      liveElapsedSeconds,
      frame.window,
      currentTime,
      runStartTimeRef.current ?? currentTime,
    );

    return frame.window;
  }

  return {
    clearedCycleCount,
    cycleGoal: config.cycleGoal,
    cycleProgressPercent,
    elapsedSeconds,
    goodSpreadNormalized: config.goodSpreadNormalized,
    lastJudgment,
    mistimedTapCount,
    nodes,
    perfectCycleCount,
    perfectSpreadNormalized: config.perfectSpreadNormalized,
    state,
    syncProgressPercent,
    tapNode,
    timeLimitSeconds: config.timeLimitSeconds,
    window,
    windowSpreadPercent,
    beginRun,
  };
}
