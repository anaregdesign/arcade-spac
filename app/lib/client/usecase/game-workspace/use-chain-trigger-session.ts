import { useEffect, useMemo, useRef, useState } from "react";

import {
  clearBrowserInterval,
  clearBrowserTimeout,
  startBrowserInterval,
  startBrowserTimeout,
  type BrowserIntervalHandle,
  type BrowserTimeoutHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type FireResult = "ignored" | "solved" | "stalled" | "transitioning";
type SessionMode = "idle" | "planning" | "transitioning" | "cleared" | "failed";

type ChainTriggerNodeDefinition = {
  id: string;
  label: string;
  outgoingIds: string[];
  threshold: number;
  xPercent: number;
  yPercent: number;
};

type ChainTriggerPuzzle = {
  extraTriggerLimit: number;
  id: string;
  label: string;
  nodes: ChainTriggerNodeDefinition[];
  sourceNodeId: string;
};

type DifficultyConfig = {
  puzzles: ChainTriggerPuzzle[];
  timeLimitSeconds: number;
};

type ResolutionSnapshot = {
  activationWaveByNodeId: Record<string, number | null>;
  incomingCountByNodeId: Record<string, number>;
  litNodeIds: string[];
  stalledNodeIds: string[];
  waveCount: number;
};

export type ChainTriggerNodeSnapshot = {
  activationWave: number | null;
  id: string;
  incomingCount: number;
  isArmed: boolean;
  isLit: boolean;
  isSource: boolean;
  label: string;
  outgoingIds: string[];
  threshold: number;
  xPercent: number;
  yPercent: number;
};

const basePuzzles: ChainTriggerPuzzle[] = [
  {
    extraTriggerLimit: 1,
    id: "bridge-lock",
    label: "Bridge lock",
    nodes: [
      { id: "core", label: "Core", outgoingIds: ["relay"], threshold: 0, xPercent: 14, yPercent: 54 },
      { id: "relay", label: "Relay", outgoingIds: ["bridge"], threshold: 1, xPercent: 36, yPercent: 54 },
      { id: "spur", label: "Spur", outgoingIds: ["bridge"], threshold: 1, xPercent: 36, yPercent: 24 },
      { id: "bridge", label: "Bridge", outgoingIds: ["crown"], threshold: 2, xPercent: 62, yPercent: 40 },
      { id: "crown", label: "Crown", outgoingIds: [], threshold: 1, xPercent: 84, yPercent: 40 },
    ],
    sourceNodeId: "core",
  },
  {
    extraTriggerLimit: 2,
    id: "triple-gate",
    label: "Triple gate",
    nodes: [
      { id: "core", label: "Core", outgoingIds: ["relay"], threshold: 0, xPercent: 14, yPercent: 54 },
      { id: "relay", label: "Relay", outgoingIds: ["gate"], threshold: 1, xPercent: 34, yPercent: 54 },
      { id: "flank-a", label: "Flank A", outgoingIds: ["gate"], threshold: 1, xPercent: 32, yPercent: 22 },
      { id: "flank-b", label: "Flank B", outgoingIds: ["gate"], threshold: 1, xPercent: 32, yPercent: 80 },
      { id: "gate", label: "Gate", outgoingIds: ["crown"], threshold: 3, xPercent: 60, yPercent: 54 },
      { id: "crown", label: "Crown", outgoingIds: [], threshold: 1, xPercent: 84, yPercent: 54 },
    ],
    sourceNodeId: "core",
  },
  {
    extraTriggerLimit: 1,
    id: "split-converge",
    label: "Split converge",
    nodes: [
      { id: "core", label: "Core", outgoingIds: ["left", "right"], threshold: 0, xPercent: 12, yPercent: 50 },
      { id: "left", label: "Left", outgoingIds: ["apex"], threshold: 1, xPercent: 32, yPercent: 28 },
      { id: "right", label: "Right", outgoingIds: ["merge"], threshold: 1, xPercent: 32, yPercent: 72 },
      { id: "scout", label: "Scout", outgoingIds: ["apex"], threshold: 1, xPercent: 54, yPercent: 16 },
      { id: "apex", label: "Apex", outgoingIds: ["crown"], threshold: 2, xPercent: 58, yPercent: 34 },
      { id: "merge", label: "Merge", outgoingIds: ["crown"], threshold: 1, xPercent: 58, yPercent: 66 },
      { id: "crown", label: "Crown", outgoingIds: [], threshold: 2, xPercent: 84, yPercent: 50 },
    ],
    sourceNodeId: "core",
  },
  {
    extraTriggerLimit: 2,
    id: "double-bridge",
    label: "Double bridge",
    nodes: [
      { id: "core", label: "Core", outgoingIds: ["north", "south"], threshold: 0, xPercent: 12, yPercent: 50 },
      { id: "north", label: "North", outgoingIds: ["mid-a"], threshold: 1, xPercent: 32, yPercent: 26 },
      { id: "south", label: "South", outgoingIds: ["mid-b"], threshold: 1, xPercent: 32, yPercent: 74 },
      { id: "wing", label: "Wing", outgoingIds: ["mid-a"], threshold: 1, xPercent: 54, yPercent: 12 },
      { id: "anchor", label: "Anchor", outgoingIds: ["mid-b"], threshold: 1, xPercent: 54, yPercent: 88 },
      { id: "mid-a", label: "Mid A", outgoingIds: ["crown"], threshold: 2, xPercent: 60, yPercent: 34 },
      { id: "mid-b", label: "Mid B", outgoingIds: ["crown"], threshold: 2, xPercent: 60, yPercent: 66 },
      { id: "crown", label: "Crown", outgoingIds: [], threshold: 2, xPercent: 84, yPercent: 50 },
    ],
    sourceNodeId: "core",
  },
  {
    extraTriggerLimit: 2,
    id: "fork-lattice",
    label: "Fork lattice",
    nodes: [
      { id: "core", label: "Core", outgoingIds: ["left", "center"], threshold: 0, xPercent: 12, yPercent: 50 },
      { id: "left", label: "Left", outgoingIds: ["north-gate"], threshold: 1, xPercent: 30, yPercent: 28 },
      { id: "center", label: "Center", outgoingIds: ["south-gate"], threshold: 1, xPercent: 32, yPercent: 66 },
      { id: "scout", label: "Scout", outgoingIds: ["north-gate"], threshold: 1, xPercent: 50, yPercent: 12 },
      { id: "anchor", label: "Anchor", outgoingIds: ["south-gate"], threshold: 1, xPercent: 50, yPercent: 88 },
      { id: "north-gate", label: "North gate", outgoingIds: ["crown"], threshold: 2, xPercent: 62, yPercent: 30 },
      { id: "south-gate", label: "South gate", outgoingIds: ["crown"], threshold: 2, xPercent: 62, yPercent: 70 },
      { id: "crown", label: "Crown", outgoingIds: [], threshold: 2, xPercent: 84, yPercent: 50 },
    ],
    sourceNodeId: "core",
  },
];

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { puzzles: basePuzzles.slice(0, 3), timeLimitSeconds: 46 },
  NORMAL: { puzzles: basePuzzles.slice(0, 4), timeLimitSeconds: 58 },
  HARD: { puzzles: basePuzzles.slice(1, 5), timeLimitSeconds: 72 },
  EXPERT: { puzzles: basePuzzles, timeLimitSeconds: 84 },
};

function toNodeMap(puzzle: ChainTriggerPuzzle) {
  return new Map(puzzle.nodes.map((node) => [node.id, node]));
}

function resolveChain(puzzle: ChainTriggerPuzzle, armedNodeIds: string[]): ResolutionSnapshot {
  const nodeMap = toNodeMap(puzzle);
  const activationWaveByNodeId = Object.fromEntries(puzzle.nodes.map((node) => [node.id, null])) as Record<string, number | null>;
  const incomingCountByNodeId = Object.fromEntries(puzzle.nodes.map((node) => [node.id, 0])) as Record<string, number>;
  const litNodeIds = new Set<string>();
  let currentWaveNodeIds = Array.from(new Set([puzzle.sourceNodeId, ...armedNodeIds].filter((id) => nodeMap.has(id))));
  let waveCount = currentWaveNodeIds.length > 0 ? 1 : 0;

  for (const nodeId of currentWaveNodeIds) {
    activationWaveByNodeId[nodeId] = 1;
    litNodeIds.add(nodeId);
  }

  while (currentWaveNodeIds.length > 0) {
    for (const nodeId of currentWaveNodeIds) {
      const node = nodeMap.get(nodeId);

      if (!node) {
        continue;
      }

      for (const targetNodeId of node.outgoingIds) {
        if (targetNodeId in incomingCountByNodeId) {
          incomingCountByNodeId[targetNodeId] += 1;
        }
      }
    }

    const nextWaveNodeIds: string[] = [];

    for (const node of puzzle.nodes) {
      if (litNodeIds.has(node.id)) {
        continue;
      }

      if (incomingCountByNodeId[node.id] >= node.threshold) {
        litNodeIds.add(node.id);
        activationWaveByNodeId[node.id] = waveCount + 1;
        nextWaveNodeIds.push(node.id);
      }
    }

    if (nextWaveNodeIds.length === 0) {
      break;
    }

    waveCount += 1;
    currentWaveNodeIds = nextWaveNodeIds;
  }

  return {
    activationWaveByNodeId,
    incomingCountByNodeId,
    litNodeIds: puzzle.nodes.filter((node) => litNodeIds.has(node.id)).map((node) => node.id),
    stalledNodeIds: puzzle.nodes.filter((node) => !litNodeIds.has(node.id)).map((node) => node.id),
    waveCount,
  };
}

function buildNodeSnapshots(
  puzzle: ChainTriggerPuzzle,
  armedNodeIds: string[],
  resolution: ResolutionSnapshot | null,
): ChainTriggerNodeSnapshot[] {
  const armedNodeIdSet = new Set(armedNodeIds);
  const litNodeIdSet = new Set(resolution?.litNodeIds ?? []);

  return puzzle.nodes.map((node) => ({
    activationWave: resolution?.activationWaveByNodeId[node.id] ?? null,
    id: node.id,
    incomingCount: resolution?.incomingCountByNodeId[node.id] ?? 0,
    isArmed: armedNodeIdSet.has(node.id),
    isLit: litNodeIdSet.has(node.id),
    isSource: node.id === puzzle.sourceNodeId,
    label: node.label,
    outgoingIds: node.outgoingIds,
    threshold: node.threshold,
    xPercent: node.xPercent,
    yPercent: node.yPercent,
  }));
}

export function useChainTriggerSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewPuzzle = useMemo(() => config.puzzles[0], [config]);
  const previewNodes = useMemo(() => buildNodeSnapshots(previewPuzzle, [], null), [previewPuzzle]);
  const [armedNodeIds, setArmedNodeIds] = useState<string[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [extraTriggerUsedCount, setExtraTriggerUsedCount] = useState(0);
  const [fireAttemptCount, setFireAttemptCount] = useState(0);
  const [lastResolution, setLastResolution] = useState<ResolutionSnapshot | null>(null);
  const [mode, setMode] = useState<SessionMode>("idle");
  const [nodes, setNodes] = useState<ChainTriggerNodeSnapshot[]>(previewNodes);
  const [solvedRoundCount, setSolvedRoundCount] = useState(0);

  const currentPuzzleRef = useRef<ChainTriggerPuzzle>(previewPuzzle);
  const timerIntervalRef = useRef<BrowserIntervalHandle>(null);
  const transitionTimeoutRef = useRef<BrowserTimeoutHandle>(null);

  useEffect(() => {
    return () => {
      clearBrowserInterval(timerIntervalRef.current);
      clearBrowserTimeout(transitionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    clearBrowserInterval(timerIntervalRef.current);
    clearBrowserTimeout(transitionTimeoutRef.current);
    currentPuzzleRef.current = previewPuzzle;

    setArmedNodeIds([]);
    setCurrentPuzzleIndex(0);
    setElapsedSeconds(0);
    setExtraTriggerUsedCount(0);
    setFireAttemptCount(0);
    setLastResolution(null);
    setMode("idle");
    setNodes(previewNodes);
    setSolvedRoundCount(0);
  }, [previewNodes, previewPuzzle]);

  useEffect(() => {
    if (mode !== "planning" && mode !== "transitioning") {
      clearBrowserInterval(timerIntervalRef.current);
      return undefined;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          clearBrowserTimeout(transitionTimeoutRef.current);
          setMode((currentMode) =>
            currentMode === "planning" || currentMode === "transitioning" ? "failed" : currentMode,
          );
        }

        return next;
      });
    }, 1000);

    return () => clearBrowserInterval(timerIntervalRef.current);
  }, [config.timeLimitSeconds, mode]);

  function openPuzzle(puzzleIndex: number) {
    const nextPuzzle = config.puzzles[puzzleIndex] ?? config.puzzles[0];

    currentPuzzleRef.current = nextPuzzle;
    setArmedNodeIds([]);
    setCurrentPuzzleIndex(puzzleIndex);
    setLastResolution(null);
    setNodes(buildNodeSnapshots(nextPuzzle, [], null));
  }

  function beginRun() {
    clearBrowserTimeout(transitionTimeoutRef.current);
    setElapsedSeconds(0);
    setExtraTriggerUsedCount(0);
    setFireAttemptCount(0);
    setSolvedRoundCount(0);
    setMode("planning");
    openPuzzle(0);
  }

  function syncNodes(nextArmedNodeIds: string[], resolution: ResolutionSnapshot | null) {
    setNodes(buildNodeSnapshots(currentPuzzleRef.current, nextArmedNodeIds, resolution));
  }

  function toggleArmNode(nodeId: string) {
    if (mode !== "planning") {
      return "ignored" as const;
    }

    const puzzle = currentPuzzleRef.current;

    if (nodeId === puzzle.sourceNodeId) {
      return "ignored" as const;
    }

    const nextArmedNodeIds = armedNodeIds.includes(nodeId)
      ? armedNodeIds.filter((currentNodeId) => currentNodeId !== nodeId)
      : armedNodeIds.length >= puzzle.extraTriggerLimit
        ? armedNodeIds
        : [...armedNodeIds, nodeId];

    if (nextArmedNodeIds === armedNodeIds) {
      return "ignored" as const;
    }

    setArmedNodeIds(nextArmedNodeIds);
    setLastResolution(null);
    syncNodes(nextArmedNodeIds, null);

    return armedNodeIds.includes(nodeId) ? "disarmed" as const : "armed" as const;
  }

  function clearArmedNodes() {
    if (mode !== "planning" || armedNodeIds.length === 0) {
      return "ignored" as const;
    }

    setArmedNodeIds([]);
    setLastResolution(null);
    syncNodes([], null);

    return "cleared" as const;
  }

  function fireChain(): FireResult {
    if (mode !== "planning") {
      return "ignored";
    }

    const puzzle = currentPuzzleRef.current;
    const resolution = resolveChain(puzzle, armedNodeIds);
    const isSolved = resolution.stalledNodeIds.length === 0;
    const nextExtraTriggerUsedCount = extraTriggerUsedCount + armedNodeIds.length;

    setExtraTriggerUsedCount(nextExtraTriggerUsedCount);
    setFireAttemptCount((current) => current + 1);
    setLastResolution(resolution);
    syncNodes(armedNodeIds, resolution);

    if (!isSolved) {
      return "stalled";
    }

    const nextSolvedRoundCount = solvedRoundCount + 1;

    setSolvedRoundCount(nextSolvedRoundCount);

    if (currentPuzzleIndex >= config.puzzles.length - 1) {
      setMode("cleared");
      return "solved";
    }

    setMode("transitioning");
    transitionTimeoutRef.current = startBrowserTimeout(() => {
      setMode("planning");
      openPuzzle(currentPuzzleIndex + 1);
    }, 650);

    return "transitioning";
  }

  return {
    armedNodeIds,
    clearArmedNodes,
    currentPuzzleIndex,
    elapsedSeconds,
    extraTriggerUsedCount,
    extraTriggerLimit: currentPuzzleRef.current.extraTriggerLimit,
    fireAttemptCount,
    fireChain,
    lastResolution,
    mode,
    nodes,
    puzzleCount: config.puzzles.length,
    puzzleLabel: currentPuzzleRef.current.label,
    solvedRoundCount,
    state: mode,
    timeLimitSeconds: config.timeLimitSeconds,
    toggleArmNode,
    beginRun,
  };
}
