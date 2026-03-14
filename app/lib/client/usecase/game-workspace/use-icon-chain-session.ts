import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "inputting" | "cleared" | "failed";

type IconToken = {
  accentColor: string;
  family: string;
  id: string;
  label: string;
};

type ClueCard = {
  detail: string;
  iconIds: string[];
  id: string;
  title: string;
  type: "adjacent" | "anchor-first" | "anchor-last" | "before" | "family" | "slot";
};

type RoundSpec = {
  candidateIds: string[];
  clues: ClueCard[];
  sequenceIds: string[];
};

type DifficultyConfig = {
  rounds: RoundSpec[];
  timeLimitSeconds: number;
  watchDurationMs: number;
};

const iconCatalog: Record<string, IconToken> = {
  bloom: { accentColor: "#ec4899", family: "nature", id: "bloom", label: "Bloom" },
  crown: { accentColor: "#fb7185", family: "royal", id: "crown", label: "Crown" },
  flame: { accentColor: "#f97316", family: "heat", id: "flame", label: "Flame" },
  gem: { accentColor: "#14b8a6", family: "stone", id: "gem", label: "Gem" },
  leaf: { accentColor: "#22c55e", family: "nature", id: "leaf", label: "Leaf" },
  moon: { accentColor: "#a78bfa", family: "sky", id: "moon", label: "Moon" },
  snow: { accentColor: "#94a3b8", family: "frost", id: "snow", label: "Snow" },
  spark: { accentColor: "#f472b6", family: "light", id: "spark", label: "Spark" },
  sun: { accentColor: "#f59e0b", family: "sky", id: "sun", label: "Sun" },
  wave: { accentColor: "#38bdf8", family: "sea", id: "wave", label: "Wave" },
};

const sequenceBank = {
  EASY: [
    ["sun", "leaf", "wave", "moon"],
    ["spark", "gem", "bloom", "crown", "flame"],
    ["moon", "wave", "leaf", "spark", "sun"],
  ],
  EXPERT: [
    ["spark", "moon", "wave", "crown", "leaf", "sun", "gem"],
    ["flame", "bloom", "sun", "gem", "moon", "wave", "crown", "snow"],
    ["leaf", "spark", "crown", "wave", "sun", "bloom", "moon", "gem"],
    ["moon", "gem", "flame", "leaf", "spark", "crown", "wave", "sun", "snow"],
    ["wave", "sun", "bloom", "gem", "spark", "leaf", "crown", "moon", "flame"],
    ["crown", "snow", "leaf", "wave", "sun", "spark", "gem", "flame", "moon"],
  ],
  HARD: [
    ["sun", "wave", "leaf", "spark", "moon", "gem"],
    ["gem", "bloom", "wave", "flame", "sun", "crown", "leaf"],
    ["moon", "leaf", "crown", "wave", "spark", "sun", "gem"],
    ["flame", "wave", "sun", "bloom", "leaf", "moon", "crown", "gem"],
    ["crown", "gem", "spark", "leaf", "wave", "sun", "moon", "snow"],
  ],
  NORMAL: [
    ["sun", "wave", "leaf", "spark", "moon"],
    ["gem", "leaf", "bloom", "flame", "crown", "wave"],
    ["moon", "spark", "wave", "sun", "leaf", "gem"],
    ["crown", "bloom", "sun", "gem", "wave", "leaf", "moon"],
  ],
} as const satisfies Record<Difficulty, readonly (readonly string[])[]>;

function getIconToken(iconId: string) {
  return iconCatalog[iconId] ?? { accentColor: "#94a3b8", family: "unknown", id: iconId, label: iconId };
}

function buildCandidateIds(sequenceIds: readonly string[]) {
  const even = sequenceIds.filter((_, index) => index % 2 === 0);
  const odd = sequenceIds.filter((_, index) => index % 2 === 1).reverse();
  const next = [...odd, ...even];

  return next.every((iconId, index) => iconId === sequenceIds[index])
    ? [...sequenceIds].reverse()
    : next;
}

function buildClues(sequenceIds: readonly string[]) {
  const slotIndex = Math.floor(sequenceIds.length / 2);
  const adjacentIndex = Math.min(1, Math.max(0, sequenceIds.length - 2));
  const orderLeftIndex = Math.min(sequenceIds.length - 3, Math.max(1, Math.floor(sequenceIds.length / 3)));
  const orderRightIndex = Math.max(orderLeftIndex + 1, sequenceIds.length - 2);
  const familyIndex = Math.max(1, sequenceIds.length - 2);
  const clues: ClueCard[] = [
    {
      detail: `${getIconToken(sequenceIds[0]).label} opens the chain.`,
      iconIds: [sequenceIds[0] ?? ""],
      id: "anchor-first",
      title: "Start",
      type: "anchor-first",
    },
    {
      detail: `${getIconToken(sequenceIds[sequenceIds.length - 1] ?? "").label} closes the chain.`,
      iconIds: [sequenceIds[sequenceIds.length - 1] ?? ""],
      id: "anchor-last",
      title: "Finish",
      type: "anchor-last",
    },
    {
      detail: `${getIconToken(sequenceIds[adjacentIndex] ?? "").label} comes immediately before ${getIconToken(sequenceIds[adjacentIndex + 1] ?? "").label}.`,
      iconIds: [sequenceIds[adjacentIndex] ?? "", sequenceIds[adjacentIndex + 1] ?? ""],
      id: "adjacent-main",
      title: "Linked pair",
      type: "adjacent",
    },
    {
      detail: `Slot ${slotIndex + 1} is ${getIconToken(sequenceIds[slotIndex] ?? "").label}.`,
      iconIds: [sequenceIds[slotIndex] ?? ""],
      id: "slot-main",
      title: "Fixed slot",
      type: "slot",
    },
    {
      detail: `${getIconToken(sequenceIds[orderLeftIndex] ?? "").label} appears before ${getIconToken(sequenceIds[orderRightIndex] ?? "").label}.`,
      iconIds: [sequenceIds[orderLeftIndex] ?? "", sequenceIds[orderRightIndex] ?? ""],
      id: "before-main",
      title: "Order clue",
      type: "before",
    },
  ];

  if (sequenceIds.length >= 6) {
    clues.push({
      detail: `Slot ${familyIndex + 1} belongs to the ${getIconToken(sequenceIds[familyIndex] ?? "").family} family.`,
      iconIds: [sequenceIds[familyIndex] ?? ""],
      id: "family-main",
      title: "Family clue",
      type: "family",
    });
  }

  if (sequenceIds.length >= 7) {
    const extraAdjacentIndex = Math.max(2, sequenceIds.length - 3);

    clues.push({
      detail: `${getIconToken(sequenceIds[extraAdjacentIndex - 1] ?? "").label} comes immediately before ${getIconToken(sequenceIds[extraAdjacentIndex] ?? "").label}.`,
      iconIds: [sequenceIds[extraAdjacentIndex - 1] ?? "", sequenceIds[extraAdjacentIndex] ?? ""],
      id: "adjacent-extra",
      title: "Second link",
      type: "adjacent",
    });
  }

  return clues;
}

function buildRound(sequenceIds: readonly string[]): RoundSpec {
  return {
    candidateIds: buildCandidateIds(sequenceIds),
    clues: buildClues(sequenceIds),
    sequenceIds: [...sequenceIds],
  };
}

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    rounds: sequenceBank.EASY.map(buildRound),
    timeLimitSeconds: 42,
    watchDurationMs: 1320,
  },
  NORMAL: {
    rounds: sequenceBank.NORMAL.map(buildRound),
    timeLimitSeconds: 54,
    watchDurationMs: 1180,
  },
  HARD: {
    rounds: sequenceBank.HARD.map(buildRound),
    timeLimitSeconds: 68,
    watchDurationMs: 1040,
  },
  EXPERT: {
    rounds: sequenceBank.EXPERT.map(buildRound),
    timeLimitSeconds: 82,
    watchDurationMs: 940,
  },
};

function getProgressIds(round: RoundSpec, confirmedIds: string[], state: SessionState) {
  if (state === "watching") {
    return round.sequenceIds;
  }

  return round.sequenceIds.map((iconId, index) => confirmedIds[index] ?? iconId);
}

export function useIconChainSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewRound = config.rounds[0];
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [longestChainLength, setLongestChainLength] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongPickCount, setWrongPickCount] = useState(0);

  const phaseTimeoutRef = useRef<number | null>(null);
  const stateRef = useRef<SessionState>("idle");
  const timerIntervalRef = useRef<number | null>(null);

  function clearPhaseTimeout() {
    if (phaseTimeoutRef.current !== null) {
      clearBrowserTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }

  function resetSession() {
    clearPhaseTimeout();

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setConfirmedIds([]);
    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setLongestChainLength(0);
    setState("idle");
    setWrongPickCount(0);
  }

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      clearPhaseTimeout();

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config]);

  useEffect(() => {
    if (state !== "watching" && state !== "inputting") {
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
          setState((currentState) => (currentState === "watching" || currentState === "inputting" ? "failed" : currentState));
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

  function beginInputPhase(round: RoundSpec) {
    const anchorId = round.sequenceIds[0] ?? "";
    const nextConfirmedIds = anchorId ? [anchorId] : [];

    setConfirmedIds(nextConfirmedIds);
    setLongestChainLength((current) => Math.max(current, nextConfirmedIds.length));
    setState("inputting");
  }

  function openRound(roundIndex: number) {
    const round = config.rounds[roundIndex] ?? previewRound;

    clearPhaseTimeout();
    setConfirmedIds([]);
    setCurrentRoundIndex(roundIndex);
    setState("watching");

    phaseTimeoutRef.current = startBrowserTimeout(() => {
      if (stateRef.current !== "watching") {
        return;
      }

      beginInputPhase(round);
    }, config.watchDurationMs);
  }

  function beginRun() {
    setElapsedSeconds(0);
    setLongestChainLength(0);
    setWrongPickCount(0);
    openRound(0);
  }

  function pressCandidate(iconId: string) {
    const round = config.rounds[currentRoundIndex] ?? previewRound;

    if (state !== "inputting") {
      return "ignored" as const;
    }

    if (confirmedIds.includes(iconId)) {
      return "ignored" as const;
    }

    const expectedIconId = round.sequenceIds[confirmedIds.length];

    if (iconId !== expectedIconId) {
      setWrongPickCount((current) => current + 1);
      beginInputPhase(round);
      return "wrong" as const;
    }

    const nextConfirmedIds = [...confirmedIds, iconId];

    setConfirmedIds(nextConfirmedIds);
    setLongestChainLength((current) => Math.max(current, nextConfirmedIds.length));

    if (nextConfirmedIds.length >= round.sequenceIds.length) {
      if (currentRoundIndex + 1 >= config.rounds.length) {
        setState("cleared");
      } else {
        openRound(currentRoundIndex + 1);
      }

      return "solved" as const;
    }

    return "correct" as const;
  }

  const currentRound = config.rounds[currentRoundIndex] ?? previewRound;
  const progressIds = getProgressIds(currentRound, confirmedIds, state);
  const nextExpectedIconId = state === "inputting" ? currentRound.sequenceIds[confirmedIds.length] ?? null : null;

  return {
    beginRun,
    candidateTokens: currentRound.candidateIds.map(getIconToken),
    clueCards: currentRound.clues,
    confirmedIds,
    currentChainLength: confirmedIds.length,
    currentRoundIndex,
    currentRoundLength: currentRound.sequenceIds.length,
    elapsedSeconds,
    iconTokensById: iconCatalog,
    longestChainLength,
    nextExpectedIconId,
    pressCandidate,
    progressIds,
    progressTokens: progressIds.map(getIconToken),
    roundCount: config.rounds.length,
    roundSolvedCount: state === "cleared" ? config.rounds.length : currentRoundIndex,
    sequenceIds: currentRound.sequenceIds,
    sequenceTokens: currentRound.sequenceIds.map(getIconToken),
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongPickCount,
  };
}
