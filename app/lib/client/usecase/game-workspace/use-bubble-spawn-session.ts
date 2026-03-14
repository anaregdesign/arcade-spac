import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type BubbleColor = "coral" | "gold" | "mint" | "violet";
type TapResult = "ignored" | "burst" | "cleared";

type SpawnEvent = {
  color: BubbleColor;
  slot: number;
};

type DifficultyConfig = {
  columnCount: number;
  initialField: SpawnEvent[];
  rowCount: number;
  saturationThreshold: number;
  schedule: SpawnEvent[];
  stabilityGainPerBurstUnit: number;
  stabilityGainPerPulse: number;
  targetStability: number;
  tickDurationMs: number;
  timeLimitSeconds: number;
};

export type BubbleSpawnCell = {
  color: BubbleColor | null;
  column: number;
  id: string;
  isBurstTarget: boolean;
  row: number;
  slot: number;
  stage: number;
};

const bubbleColorLabels: Record<BubbleColor, string> = {
  coral: "Coral",
  gold: "Gold",
  mint: "Mint",
  violet: "Violet",
};

const saturationByStage = [0, 8, 16, 26, 38] as const;
const baseSchedule: SpawnEvent[] = [
  { color: "coral", slot: 6 },
  { color: "coral", slot: 7 },
  { color: "mint", slot: 12 },
  { color: "mint", slot: 13 },
  { color: "gold", slot: 1 },
  { color: "gold", slot: 2 },
  { color: "coral", slot: 11 },
  { color: "mint", slot: 8 },
  { color: "violet", slot: 17 },
  { color: "violet", slot: 18 },
  { color: "coral", slot: 16 },
  { color: "gold", slot: 3 },
  { color: "gold", slot: 4 },
  { color: "mint", slot: 14 },
  { color: "coral", slot: 10 },
  { color: "violet", slot: 15 },
  { color: "gold", slot: 9 },
  { color: "coral", slot: 5 },
  { color: "gold", slot: 0 },
  { color: "violet", slot: 19 },
];

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    columnCount: 5,
    initialField: baseSchedule.slice(0, 3),
    rowCount: 4,
    saturationThreshold: 196,
    schedule: baseSchedule,
    stabilityGainPerBurstUnit: 4,
    stabilityGainPerPulse: 3,
    targetStability: 36,
    tickDurationMs: 980,
    timeLimitSeconds: 42,
  },
  NORMAL: {
    columnCount: 5,
    initialField: baseSchedule.slice(0, 4),
    rowCount: 4,
    saturationThreshold: 188,
    schedule: baseSchedule,
    stabilityGainPerBurstUnit: 4,
    stabilityGainPerPulse: 3,
    targetStability: 46,
    tickDurationMs: 920,
    timeLimitSeconds: 50,
  },
  HARD: {
    columnCount: 5,
    initialField: baseSchedule.slice(0, 5),
    rowCount: 4,
    saturationThreshold: 180,
    schedule: baseSchedule,
    stabilityGainPerBurstUnit: 3,
    stabilityGainPerPulse: 2,
    targetStability: 54,
    tickDurationMs: 860,
    timeLimitSeconds: 60,
  },
  EXPERT: {
    columnCount: 5,
    initialField: baseSchedule.slice(0, 6),
    rowCount: 4,
    saturationThreshold: 172,
    schedule: baseSchedule,
    stabilityGainPerBurstUnit: 3,
    stabilityGainPerPulse: 2,
    targetStability: 62,
    tickDurationMs: 820,
    timeLimitSeconds: 72,
  },
};

function buildEmptyField(config: DifficultyConfig): BubbleSpawnCell[] {
  return Array.from({ length: config.rowCount * config.columnCount }, (_, slot): BubbleSpawnCell => ({
    color: null,
    column: slot % config.columnCount,
    id: `bubble-spawn-slot-${slot}`,
    isBurstTarget: false,
    row: Math.floor(slot / config.columnCount),
    slot,
    stage: 0,
  }));
}

function cloneField(field: BubbleSpawnCell[]) {
  return field.map((cell) => ({ ...cell }));
}

function getNeighborSlots(slot: number, rowCount: number, columnCount: number) {
  const row = Math.floor(slot / columnCount);
  const column = slot % columnCount;
  const candidates = [
    { column, row: row - 1 },
    { column: column + 1, row },
    { column, row: row + 1 },
    { column: column - 1, row },
  ];

  return candidates
    .filter((candidate) =>
      candidate.row >= 0
      && candidate.column >= 0
      && candidate.row < rowCount
      && candidate.column < columnCount,
    )
    .map((candidate) => candidate.row * columnCount + candidate.column);
}

function spawnIntoField(field: BubbleSpawnCell[], spawnEvent: SpawnEvent) {
  const nextField = cloneField(field);
  const targetCell = nextField[spawnEvent.slot];

  if (!targetCell) {
    return nextField;
  }

  if (!targetCell.color) {
    targetCell.color = spawnEvent.color;
    targetCell.stage = 1;
    return nextField;
  }

  targetCell.stage = Math.min(4, targetCell.stage + (targetCell.color === spawnEvent.color ? 2 : 1));

  return nextField;
}

function populateField(config: DifficultyConfig, events: SpawnEvent[]): BubbleSpawnCell[] {
  return events.reduce<BubbleSpawnCell[]>((field, spawnEvent) => spawnIntoField(field, spawnEvent), buildEmptyField(config));
}

function growField(field: BubbleSpawnCell[]) {
  return field.map((cell) => (cell.color
    ? {
        ...cell,
        stage: Math.min(4, cell.stage + 1),
      }
    : { ...cell }));
}

function calculateSaturation(field: BubbleSpawnCell[]) {
  return field.reduce((total, cell) => total + saturationByStage[cell.stage], 0);
}

function countLiveBubbles(field: BubbleSpawnCell[]) {
  return field.filter((cell) => cell.color).length;
}

function getLargestThreat(field: BubbleSpawnCell[]) {
  const liveCells = field.filter((cell) => cell.color);

  if (liveCells.length === 0) {
    return null;
  }

  return liveCells.reduce((largest, cell) => {
    if (!largest) {
      return cell;
    }

    if (cell.stage > largest.stage) {
      return cell;
    }

    if (cell.stage === largest.stage && cell.slot < largest.slot) {
      return cell;
    }

    return largest;
  }, liveCells[0] ?? null);
}

function describeBubble(cell: BubbleSpawnCell | null) {
  if (!cell?.color) {
    return "Field clear";
  }

  return `${bubbleColorLabels[cell.color]} S${cell.stage}`;
}

function describeSpawn(spawnEvent: SpawnEvent | null) {
  if (!spawnEvent) {
    return "Sequence complete";
  }

  return `${bubbleColorLabels[spawnEvent.color]} to S${spawnEvent.slot + 1}`;
}

function collectBurstSlots(field: BubbleSpawnCell[], startSlot: number, rowCount: number, columnCount: number) {
  const startCell = field[startSlot];

  if (!startCell?.color) {
    return [];
  }

  const startColor = startCell.color;
  const connectedSameColor = new Set<number>();
  const queue = [startSlot];

  while (queue.length > 0) {
    const currentSlot = queue.pop()!;
    const currentCell = field[currentSlot];

    if (!currentCell?.color || currentCell.color !== startColor || connectedSameColor.has(currentSlot)) {
      continue;
    }

    connectedSameColor.add(currentSlot);

    for (const neighborSlot of getNeighborSlots(currentSlot, rowCount, columnCount)) {
      if (!connectedSameColor.has(neighborSlot)) {
        queue.push(neighborSlot);
      }
    }
  }

  const burstSlots = new Set<number>(connectedSameColor);
  const canSpread = startCell.stage >= 3 || connectedSameColor.size >= 2;

  if (!canSpread) {
    return Array.from(burstSlots);
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const currentSlot of Array.from(burstSlots)) {
      for (const neighborSlot of getNeighborSlots(currentSlot, rowCount, columnCount)) {
        const neighbor = field[neighborSlot];

        if (!neighbor?.color || burstSlots.has(neighborSlot)) {
          continue;
        }

        if (neighbor.color === startColor || neighbor.stage <= 2) {
          burstSlots.add(neighborSlot);
          changed = true;
        }
      }
    }
  }

  return Array.from(burstSlots);
}

function resolveBurst(field: BubbleSpawnCell[], slot: number, rowCount: number, columnCount: number) {
  const burstSlots = collectBurstSlots(field, slot, rowCount, columnCount);
  const startCell = field[slot];

  if (!startCell?.color || burstSlots.length === 0) {
    return null;
  }

  const nextField = cloneField(field);

  for (const burstSlot of burstSlots) {
    nextField[burstSlot] = {
      ...nextField[burstSlot],
      color: null,
      isBurstTarget: false,
      stage: 0,
    };
  }

  return {
    chainCount: burstSlots.length,
    field: nextField,
    label: `${bubbleColorLabels[startCell.color]} x${burstSlots.length}`,
  };
}

function scoreBurstTarget(field: BubbleSpawnCell[], slot: number, rowCount: number, columnCount: number) {
  const cell = field[slot];

  if (!cell?.color) {
    return -1;
  }

  const burst = resolveBurst(field, slot, rowCount, columnCount);

  if (!burst) {
    return -1;
  }

  return burst.chainCount * 60 + saturationByStage[cell.stage] + (cell.stage >= 3 ? 24 : 0);
}

function markBurstTarget(field: BubbleSpawnCell[], rowCount: number, columnCount: number) {
  const scores = field.map((_, slot) => scoreBurstTarget(field, slot, rowCount, columnCount));
  const bestScore = scores.reduce((currentBest, score) => Math.max(currentBest, score), -1);

  if (bestScore < 0) {
    return cloneField(field);
  }

  const bestSlot = scores.findIndex((score) => score === bestScore);

  return field.map((cell, slot) => ({
    ...cell,
    isBurstTarget: slot === bestSlot && Boolean(cell.color),
  }));
}

function buildSeedField(config: DifficultyConfig) {
  return markBurstTarget(populateField(config, config.initialField), config.rowCount, config.columnCount);
}

export function useBubbleSpawnSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewField = useMemo(() => buildSeedField(config), [config]);
  const [bestChainCount, setBestChainCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [field, setField] = useState<BubbleSpawnCell[]>(previewField);
  const [lastBurstLabel, setLastBurstLabel] = useState("No burst yet");
  const [lastChainCount, setLastChainCount] = useState(0);
  const [largestThreatLabel, setLargestThreatLabel] = useState(describeBubble(getLargestThreat(previewField)));
  const [liveBubbleCount, setLiveBubbleCount] = useState(countLiveBubbles(previewField));
  const [nextSpawnLabel, setNextSpawnLabel] = useState(
    describeSpawn(config.schedule[config.initialField.length % config.schedule.length] ?? null),
  );
  const [saturation, setSaturation] = useState(calculateSaturation(previewField));
  const [stabilityScore, setStabilityScore] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  const bestChainCountRef = useRef(0);
  const fieldRef = useRef<BubbleSpawnCell[]>(previewField);
  const pulseIntervalRef = useRef<number | null>(null);
  const scheduleIndexRef = useRef(config.initialField.length);
  const stabilityScoreRef = useRef(0);
  const stateRef = useRef<SessionState>("idle");
  const timerIntervalRef = useRef<number | null>(null);

  function clearIntervals() {
    if (pulseIntervalRef.current !== null) {
      clearBrowserInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function applyField(nextField: BubbleSpawnCell[]) {
    const markedField = markBurstTarget(nextField, config.rowCount, config.columnCount);
    const largestThreat = getLargestThreat(markedField);

    fieldRef.current = markedField;
    setField(markedField);
    setLiveBubbleCount(countLiveBubbles(markedField));
    setLargestThreatLabel(describeBubble(largestThreat));
    setSaturation(calculateSaturation(markedField));
  }

  function setStateSafely(nextState: SessionState) {
    stateRef.current = nextState;
    setState(nextState);
  }

  function resetSession() {
    clearIntervals();

    const nextPreviewField = buildSeedField(config);

    bestChainCountRef.current = 0;
    fieldRef.current = nextPreviewField;
    scheduleIndexRef.current = config.initialField.length;
    stabilityScoreRef.current = 0;
    stateRef.current = "idle";

    setBestChainCount(0);
    setElapsedSeconds(0);
    setField(nextPreviewField);
    setLastBurstLabel("No burst yet");
    setLastChainCount(0);
    setLargestThreatLabel(describeBubble(getLargestThreat(nextPreviewField)));
    setLiveBubbleCount(countLiveBubbles(nextPreviewField));
    setNextSpawnLabel(describeSpawn(config.schedule[config.initialField.length % config.schedule.length] ?? null));
    setSaturation(calculateSaturation(nextPreviewField));
    setStabilityScore(0);
    setState("idle");
  }

  function completeRun(nextState: Extract<SessionState, "cleared" | "failed">) {
    clearIntervals();
    setStateSafely(nextState);
  }

  function advancePressurePulse() {
    if (stateRef.current !== "playing") {
      return;
    }

    const nextScheduleIndex = scheduleIndexRef.current % config.schedule.length;
    const spawnEvent = config.schedule[nextScheduleIndex] ?? null;
    let nextField = growField(fieldRef.current);

    if (spawnEvent) {
      nextField = spawnIntoField(nextField, spawnEvent);
      scheduleIndexRef.current += 1;
      setNextSpawnLabel(describeSpawn(config.schedule[scheduleIndexRef.current % config.schedule.length] ?? null));
    }

    const nextStabilityScore = Math.min(config.targetStability, stabilityScoreRef.current + config.stabilityGainPerPulse);
    const nextSaturation = calculateSaturation(nextField);

    stabilityScoreRef.current = nextStabilityScore;
    setStabilityScore(nextStabilityScore);
    applyField(nextField);

    if (nextSaturation >= config.saturationThreshold) {
      setLastBurstLabel("Field overflow");
      setLastChainCount(0);
      completeRun("failed");
      return;
    }

    if (nextStabilityScore >= config.targetStability) {
      completeRun("cleared");
    }
  }

  useEffect(() => {
    return () => {
      clearIntervals();
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config, previewField]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (state !== "playing") {
      clearIntervals();
      return;
    }

    pulseIntervalRef.current = startBrowserInterval(advancePressurePulse, config.tickDurationMs);
    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          completeRun("failed");
        }

        return next;
      });
    }, 1000);

    return () => {
      clearIntervals();
    };
  }, [config.tickDurationMs, config.timeLimitSeconds, state]);

  function beginRun() {
    const seededField = buildSeedField(config);

    clearIntervals();
    bestChainCountRef.current = 0;
    fieldRef.current = seededField;
    scheduleIndexRef.current = config.initialField.length;
    stabilityScoreRef.current = 0;

    setBestChainCount(0);
    setElapsedSeconds(0);
    applyField(seededField);
    setLastBurstLabel("Pressure rising");
    setLastChainCount(0);
    setNextSpawnLabel(describeSpawn(config.schedule[config.initialField.length % config.schedule.length] ?? null));
    setStabilityScore(0);
    setStateSafely("playing");
  }

  function burstBubble(slot: number): TapResult {
    if (stateRef.current !== "playing") {
      return "ignored";
    }

    const resolved = resolveBurst(fieldRef.current, slot, config.rowCount, config.columnCount);

    if (!resolved) {
      return "ignored";
    }

    const nextBestChainCount = Math.max(bestChainCountRef.current, resolved.chainCount);
    const stabilityGain = resolved.chainCount * config.stabilityGainPerBurstUnit + (resolved.chainCount >= 3 ? 2 : 0);
    const nextStabilityScore = Math.min(config.targetStability, stabilityScoreRef.current + stabilityGain);

    bestChainCountRef.current = nextBestChainCount;
    stabilityScoreRef.current = nextStabilityScore;

    setBestChainCount(nextBestChainCount);
    setLastBurstLabel(resolved.label);
    setLastChainCount(resolved.chainCount);
    setStabilityScore(nextStabilityScore);
    applyField(resolved.field);

    if (nextStabilityScore >= config.targetStability) {
      completeRun("cleared");
      return "cleared";
    }

    return "burst";
  }

  return {
    beginRun,
    bestChainCount,
    burstBubble,
    burstTargetSlot: field.find((cell) => cell.isBurstTarget)?.slot ?? -1,
    columnCount: config.columnCount,
    elapsedSeconds,
    field,
    largestThreatLabel,
    lastBurstLabel,
    lastChainCount,
    liveBubbleCount,
    nextSpawnLabel,
    rowCount: config.rowCount,
    saturation,
    saturationThreshold: config.saturationThreshold,
    stabilityScore,
    state,
    targetStability: config.targetStability,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
