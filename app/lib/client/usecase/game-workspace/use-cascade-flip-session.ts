import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "revealing" | "tracking" | "cleared" | "failed";
type TapResult = "correct" | "ignored" | "miss" | "round-cleared";
type ThemeId = "amber" | "mint" | "plum" | "rose" | "sky" | "teal";

type CardTheme = {
  color: string;
  themeId: ThemeId;
  label: string;
};

type StreamCard = CardTheme & {
  id: string;
};

type VisibleCard = StreamCard & {
  isResolved: boolean;
  isSolution: boolean;
  laneIndex: number;
  rowIndex: number;
};

type RawRoundDefinition = {
  id: string;
  lanes: [ThemeId[], ThemeId[], ThemeId[]];
  name: string;
  targetSequence: ThemeId[];
};

type RoundDefinition = {
  id: string;
  lanes: [StreamCard[], StreamCard[], StreamCard[]];
  name: string;
  targetSequence: ThemeId[];
};

type DifficultyConfig = {
  revealDurationMs: number;
  rounds: RoundDefinition[];
  streamTickMs: number;
  timeLimitSeconds: number;
};

const VISIBLE_ROW_COUNT = 4;
const DEFAULT_ROUND_INDEX = 0;

const cardThemes: CardTheme[] = [
  { color: "#f59e0b", themeId: "amber", label: "A" },
  { color: "#34d399", themeId: "mint", label: "C" },
  { color: "#a78bfa", themeId: "plum", label: "E" },
  { color: "#fb7185", themeId: "rose", label: "D" },
  { color: "#38bdf8", themeId: "sky", label: "B" },
  { color: "#14b8a6", themeId: "teal", label: "F" },
];

const themeById = new Map(cardThemes.map((theme) => [theme.themeId, theme] as const));

const rawRounds = [
  {
    id: "cinder-drop",
    lanes: [
      ["amber", "sky", "plum", "mint", "rose", "teal", "amber"],
      ["rose", "teal", "sky", "amber", "mint", "plum", "rose"],
      ["mint", "plum", "amber", "rose", "sky", "teal", "mint"],
    ],
    name: "Cinder Drop",
    targetSequence: ["amber", "plum", "mint", "rose"],
  },
  {
    id: "signal-step",
    lanes: [
      ["teal", "amber", "rose", "sky", "plum", "mint", "teal"],
      ["plum", "mint", "amber", "teal", "rose", "sky", "plum"],
      ["sky", "rose", "mint", "plum", "amber", "teal", "sky"],
    ],
    name: "Signal Step",
    targetSequence: ["teal", "rose", "amber", "sky"],
  },
  {
    id: "glass-run",
    lanes: [
      ["rose", "sky", "plum", "amber", "teal", "mint", "rose"],
      ["amber", "mint", "teal", "sky", "plum", "rose", "amber"],
      ["teal", "plum", "amber", "mint", "sky", "rose", "teal"],
    ],
    name: "Glass Run",
    targetSequence: ["plum", "amber", "teal", "mint"],
  },
  {
    id: "night-fold",
    lanes: [
      ["sky", "amber", "rose", "teal", "plum", "mint", "sky"],
      ["mint", "plum", "amber", "sky", "rose", "teal", "mint"],
      ["teal", "rose", "plum", "amber", "sky", "mint", "teal"],
    ],
    name: "Night Fold",
    targetSequence: ["sky", "rose", "plum", "amber", "teal"],
  },
  {
    id: "loop-shift",
    lanes: [
      ["mint", "sky", "teal", "amber", "rose", "plum", "mint"],
      ["amber", "rose", "plum", "sky", "teal", "mint", "amber"],
      ["plum", "teal", "amber", "mint", "sky", "rose", "plum"],
    ],
    name: "Loop Shift",
    targetSequence: ["mint", "sky", "teal", "amber", "rose"],
  },
] as const satisfies readonly RawRoundDefinition[];

function buildRound(rawRound: RawRoundDefinition): RoundDefinition {
  return {
    id: rawRound.id,
    lanes: rawRound.lanes.map((lane, laneIndex) =>
      lane.map((themeId, queueIndex) => {
        const theme = themeById.get(themeId);

        if (!theme) {
          throw new Error(`Unknown cascade flip theme ${themeId}`);
        }

        return {
          ...theme,
          id: `${rawRound.id}-lane-${laneIndex}-card-${queueIndex}`,
        };
      }),
    ) as [StreamCard[], StreamCard[], StreamCard[]],
    name: rawRound.name,
    targetSequence: [...rawRound.targetSequence],
  };
}

const rounds = rawRounds.map((round) => buildRound(round));

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    revealDurationMs: 1200,
    rounds: [rounds[0], rounds[1]],
    streamTickMs: 720,
    timeLimitSeconds: 44,
  },
  NORMAL: {
    revealDurationMs: 1100,
    rounds: [rounds[0], rounds[1], rounds[2]],
    streamTickMs: 620,
    timeLimitSeconds: 56,
  },
  HARD: {
    revealDurationMs: 980,
    rounds: [rounds[0], rounds[1], rounds[2], rounds[3]],
    streamTickMs: 540,
    timeLimitSeconds: 72,
  },
  EXPERT: {
    revealDurationMs: 900,
    rounds: [rounds[0], rounds[2], rounds[3], rounds[4], rounds[1]],
    streamTickMs: 470,
    timeLimitSeconds: 88,
  },
};

function getVisibleCards(
  round: RoundDefinition | null,
  streamOffset: number,
  resolvedCardIds: Set<string>,
) {
  if (!round) {
    return [] as VisibleCard[];
  }

  return Array.from({ length: VISIBLE_ROW_COUNT }, (_, rowIndex) =>
    round.lanes.map((lane, laneIndex) => {
      const card = lane[(streamOffset + rowIndex) % lane.length] ?? lane[0];

      return {
        ...card,
        isResolved: resolvedCardIds.has(card.id),
        isSolution: false,
        laneIndex,
        rowIndex,
      };
    }),
  ).flat();
}

function getSolutionCardId(visibleCards: VisibleCard[], currentTargetThemeId: ThemeId | null) {
  if (!currentTargetThemeId) {
    return null;
  }

  return visibleCards.find((card) => !card.isResolved && card.themeId === currentTargetThemeId)?.id ?? null;
}

export function useCascadeFlipSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(DEFAULT_ROUND_INDEX);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActionLabel, setLastActionLabel] = useState("Start the run to reveal the next target order.");
  const [missCount, setMissCount] = useState(0);
  const [resolvedCardIds, setResolvedCardIds] = useState<string[]>([]);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [streamOffset, setStreamOffset] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);

  const revealTimeoutRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const stateRef = useRef<SessionState>("idle");

  const currentRound = config.rounds[currentRoundIndex] ?? config.rounds[0];
  const currentTargetThemeId = currentRound?.targetSequence[targetIndex] ?? null;
  const resolvedCardIdSet = useMemo(() => new Set(resolvedCardIds), [resolvedCardIds]);
  const visibleCards = useMemo(
    () => {
      const nextVisibleCards = getVisibleCards(currentRound, streamOffset, resolvedCardIdSet);
      const nextSolutionCardId = getSolutionCardId(nextVisibleCards, currentTargetThemeId);

      return nextVisibleCards.map((card) => ({
        ...card,
        isSolution: card.id === nextSolutionCardId,
      }));
    },
    [currentRound, currentTargetThemeId, resolvedCardIdSet, streamOffset],
  );
  const solutionCardId = useMemo(
    () => getSolutionCardId(visibleCards, currentTargetThemeId),
    [currentTargetThemeId, visibleCards],
  );

  function clearRevealTimeout() {
    if (revealTimeoutRef.current !== null) {
      clearBrowserTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }

  function clearIntervals() {
    if (streamIntervalRef.current !== null) {
      clearBrowserInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function resetSession() {
    clearRevealTimeout();
    clearIntervals();
    stateRef.current = "idle";
    setCurrentRoundIndex(DEFAULT_ROUND_INDEX);
    setElapsedSeconds(0);
    setLastActionLabel("Start the run to reveal the next target order.");
    setMissCount(0);
    setResolvedCardIds([]);
    setResolvedCount(0);
    setState("idle");
    setStreamOffset(0);
    setTargetIndex(0);
  }

  function openRound(roundIndex: number) {
    clearRevealTimeout();
    setCurrentRoundIndex(roundIndex);
    setStreamOffset(0);
    setTargetIndex(0);
    setResolvedCardIds([]);
    stateRef.current = "revealing";
    setState("revealing");
    setLastActionLabel(`${config.rounds[roundIndex]?.name ?? "Cascade board"} reveal`);

    revealTimeoutRef.current = startBrowserTimeout(() => {
      stateRef.current = "tracking";
      setState("tracking");
      setLastActionLabel("Stream live");
    }, config.revealDurationMs);
  }

  useEffect(() => {
    return () => {
      clearRevealTimeout();
      clearIntervals();
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config]);

  useEffect(() => {
    if (state !== "revealing" && state !== "tracking") {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          clearRevealTimeout();
          clearIntervals();
          stateRef.current = "failed";
          setState("failed");
          setLastActionLabel("Time expired");
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [config.timeLimitSeconds, state]);

  useEffect(() => {
    if (state !== "tracking" || !currentRound) {
      if (streamIntervalRef.current !== null) {
        clearBrowserInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }

      return;
    }

    streamIntervalRef.current = startBrowserInterval(() => {
      setStreamOffset((current) => (current + 1) % currentRound.lanes[0].length);
    }, config.streamTickMs);

    return () => {
      if (streamIntervalRef.current !== null) {
        clearBrowserInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    };
  }, [config.streamTickMs, currentRound, state]);

  function beginRun() {
    clearRevealTimeout();
    clearIntervals();
    setElapsedSeconds(0);
    setMissCount(0);
    setResolvedCount(0);
    openRound(DEFAULT_ROUND_INDEX);
  }

  function tapCard(cardId: string): TapResult {
    if (stateRef.current !== "tracking" || !currentRound || !currentTargetThemeId) {
      return "ignored";
    }

    const card = visibleCards.find((candidate) => candidate.id === cardId) ?? null;

    if (!card || card.isResolved) {
      return "ignored";
    }

    if (card.themeId === currentTargetThemeId) {
      const nextResolvedCardIds = [...resolvedCardIds, card.id];
      const nextResolvedCount = resolvedCount + 1;
      const nextTargetIndex = targetIndex + 1;

      setResolvedCardIds(nextResolvedCardIds);
      setResolvedCount(nextResolvedCount);
      setLastActionLabel(`${card.label} resolved target ${targetIndex + 1}`);

      if (nextTargetIndex >= currentRound.targetSequence.length) {
        if (currentRoundIndex + 1 >= config.rounds.length) {
          clearRevealTimeout();
          clearIntervals();
          stateRef.current = "cleared";
          setState("cleared");
          return "round-cleared";
        }

        openRound(currentRoundIndex + 1);
        return "round-cleared";
      }

      setTargetIndex(nextTargetIndex);
      return "correct";
    }

    const nextMissCount = missCount + 1;

    setMissCount(nextMissCount);
    setLastActionLabel(`${card.label} was off-order`);
    return "miss";
  }

  return {
    beginRun,
    cardGoal: config.rounds.reduce((total, round) => total + round.targetSequence.length, 0),
    currentRoundIndex,
    currentRoundName: currentRound?.name ?? "Cascade board",
    currentTargetLabel: currentTargetThemeId ? themeById.get(currentTargetThemeId)?.label ?? null : null,
    elapsedSeconds,
    lastActionLabel,
    missCount,
    phase: state === "revealing" ? "reveal" : state === "tracking" ? "live" : state === "idle" ? "idle" : state,
    resolvedCount,
    roundCount: config.rounds.length,
    sequenceCards: currentRound?.targetSequence.map((themeId, index) => ({
      id: `${currentRound.id}-target-${index}`,
      isCurrent: state === "tracking" && index === targetIndex,
      isResolved: index < targetIndex,
      label: themeById.get(themeId)?.label ?? "?",
      themeId,
    })) ?? [],
    solutionCardId,
    state,
    streamSpeedLabel: `${(config.streamTickMs / 1000).toFixed(2)}s / shift`,
    tapCard,
    timeLimitSeconds: config.timeLimitSeconds,
    visibleCards,
  };
}
