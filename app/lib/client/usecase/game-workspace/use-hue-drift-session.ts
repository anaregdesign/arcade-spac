import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomIntInRange, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type RuleKind = "hue" | "lightness" | "saturation";

export type DriftColor = {
  h: number;
  l: number;
  s: number;
};

type HueDriftPrompt = {
  choices: DriftColor[];
  correctChoice: DriftColor;
  missingIndex: number;
  ruleLabel: string;
  visibleSteps: (DriftColor | null)[];
};

type DifficultyConfig = {
  problemCount: number;
  ruleSet: RuleKind[];
  stepCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { problemCount: 4, ruleSet: ["hue", "lightness"], stepCount: 5, timeLimitSeconds: 34 },
  NORMAL: { problemCount: 5, ruleSet: ["hue", "lightness", "saturation"], stepCount: 5, timeLimitSeconds: 44 },
  HARD: { problemCount: 6, ruleSet: ["hue", "lightness", "saturation"], stepCount: 6, timeLimitSeconds: 56 },
  EXPERT: { problemCount: 7, ruleSet: ["hue", "lightness", "saturation"], stepCount: 6, timeLimitSeconds: 70 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHue(value: number) {
  return ((value % 360) + 360) % 360;
}

function colorKey(color: DriftColor) {
  return `${color.h}:${color.s}:${color.l}`;
}

function buildBaseColor(rule: RuleKind): DriftColor {
  return {
    h: randomIntInRange(12, 320),
    l: rule === "lightness" ? randomIntInRange(26, 52) : randomIntInRange(36, 62),
    s: rule === "saturation" ? randomIntInRange(34, 58) : randomIntInRange(56, 82),
  };
}

function advanceColor(color: DriftColor, rule: RuleKind, stepDelta: number): DriftColor {
  if (rule === "hue") {
    return {
      ...color,
      h: normalizeHue(color.h + stepDelta),
    };
  }

  if (rule === "saturation") {
    return {
      ...color,
      s: clamp(color.s + stepDelta, 18, 92),
    };
  }

  return {
    ...color,
    l: clamp(color.l + stepDelta, 18, 84),
  };
}

function buildSequence(rule: RuleKind, stepCount: number) {
  const base = buildBaseColor(rule);
  const delta = rule === "hue" ? randomIntInRange(18, 34) : randomIntInRange(7, 12);
  const signedDelta = shuffleValues([delta, -delta])[0];
  const colors = [base];

  while (colors.length < stepCount) {
    colors.push(advanceColor(colors[colors.length - 1], rule, signedDelta));
  }

  return colors;
}

function buildDistractors(correct: DriftColor, rule: RuleKind) {
  const candidates = new Map<string, DriftColor>([[colorKey(correct), correct]]);
  const variants = rule === "hue"
    ? [
        { ...correct, h: normalizeHue(correct.h + 12) },
        { ...correct, h: normalizeHue(correct.h - 12) },
        { ...correct, s: clamp(correct.s + 10, 18, 92) },
        { ...correct, l: clamp(correct.l - 10, 18, 84) },
      ]
    : rule === "saturation"
      ? [
          { ...correct, s: clamp(correct.s + 9, 18, 92) },
          { ...correct, s: clamp(correct.s - 9, 18, 92) },
          { ...correct, h: normalizeHue(correct.h + 16) },
          { ...correct, l: clamp(correct.l + 8, 18, 84) },
        ]
      : [
          { ...correct, l: clamp(correct.l + 8, 18, 84) },
          { ...correct, l: clamp(correct.l - 8, 18, 84) },
          { ...correct, h: normalizeHue(correct.h + 14) },
          { ...correct, s: clamp(correct.s - 10, 18, 92) },
        ];

  for (const variant of variants) {
    candidates.set(colorKey(variant), variant);

    if (candidates.size >= 4) {
      break;
    }
  }

  return shuffleValues([...candidates.values()]).slice(0, 4);
}

function buildPrompt(config: DifficultyConfig): HueDriftPrompt {
  const rule = shuffleValues(config.ruleSet)[0];
  const fullSequence = buildSequence(rule, config.stepCount);
  const missingIndex = randomIntInRange(1, config.stepCount - 2);
  const correctChoice = fullSequence[missingIndex];
  const visibleSteps = fullSequence.map((step, index) => (index === missingIndex ? null : step));

  return {
    choices: buildDistractors(correctChoice, rule),
    correctChoice,
    missingIndex,
    ruleLabel: rule === "hue" ? "Hue drift" : rule === "saturation" ? "Saturation drift" : "Lightness drift",
    visibleSteps,
  };
}

function createPreviewPrompt(config: DifficultyConfig): HueDriftPrompt {
  const previewSteps: DriftColor[] = Array.from({ length: config.stepCount }, (_, index) => ({
    h: 198,
    l: 38 + index * 8,
    s: 74 - index * 8,
  }));
  const missingIndex = Math.min(2, config.stepCount - 2);
  const correctChoice = previewSteps[missingIndex];

  return {
    choices: [
      correctChoice,
      { h: 198, s: 64, l: 58 },
      { h: 212, s: 58, l: 54 },
      { h: 198, s: 48, l: 60 },
    ],
    correctChoice,
    missingIndex,
    ruleLabel: "Lightness drift",
    visibleSteps: previewSteps.map((step, index) => (index === missingIndex ? null : step)),
  };
}

export function useHueDriftSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [problems, setProblems] = useState<HueDriftPrompt[]>(() => [createPreviewPrompt(config)]);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setCurrentProblemIndex(0);
    setElapsedSeconds(0);
    setMistakeCount(0);
    setProblems([createPreviewPrompt(config)]);
    setState("idle");
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    setCurrentProblemIndex(0);
    setElapsedSeconds(0);
    setMistakeCount(0);
    setProblems(Array.from({ length: config.problemCount }, () => buildPrompt(config)));
    setState("playing");
  }

  function answerPrompt(choice: DriftColor) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const currentProblem = problems[currentProblemIndex];

    if (!currentProblem) {
      return "ignored" as const;
    }

    const isCorrect = colorKey(choice) === colorKey(currentProblem.correctChoice);

    if (!isCorrect) {
      setMistakeCount((current) => current + 1);
      return "wrong" as const;
    }

    const nextProblemIndex = currentProblemIndex + 1;

    if (nextProblemIndex >= problems.length) {
      setState("cleared");
      return "correct" as const;
    }

    setCurrentProblemIndex(nextProblemIndex);
    return "correct" as const;
  }

  return {
    answerPrompt,
    beginRun,
    currentProblem: problems[currentProblemIndex] ?? createPreviewPrompt(config),
    currentProblemIndex,
    elapsedSeconds,
    mistakeCount,
    problemCount: config.problemCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
