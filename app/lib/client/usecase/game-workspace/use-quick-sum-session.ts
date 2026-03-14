import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomIntInRange, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type QuickSumProblem = {
  answer: number;
  choices: number[];
  prompt: string;
};

type DifficultyConfig = {
  allowMultiply: boolean;
  maxOperand: number;
  problemCount: number;
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { allowMultiply: false, maxOperand: 10, problemCount: 4, timeLimitSeconds: 30 },
  NORMAL: { allowMultiply: false, maxOperand: 14, problemCount: 5, timeLimitSeconds: 40 },
  HARD: { allowMultiply: true, maxOperand: 18, problemCount: 6, timeLimitSeconds: 54 },
  EXPERT: { allowMultiply: true, maxOperand: 24, problemCount: 7, timeLimitSeconds: 68 },
};

function buildChoices(answer: number) {
  const choices = new Set<number>([answer]);

  while (choices.size < 4) {
    choices.add(Math.max(0, answer + randomIntInRange(-5, 5)));
  }

  return shuffleValues([...choices]);
}

function buildProblem(config: DifficultyConfig): QuickSumProblem {
  const operator = config.allowMultiply
    ? shuffleValues(["+", "-", "*"] as const)[0]
    : shuffleValues(["+", "-"] as const)[0];

  if (operator === "+") {
    const left = randomIntInRange(2, config.maxOperand);
    const right = randomIntInRange(1, config.maxOperand);
    const answer = left + right;

    return {
      answer,
      choices: buildChoices(answer),
      prompt: `${left} + ${right}`,
    };
  }

  if (operator === "-") {
    const left = randomIntInRange(6, config.maxOperand + 8);
    const right = randomIntInRange(1, Math.max(2, left - 1));
    const answer = left - right;

    return {
      answer,
      choices: buildChoices(answer),
      prompt: `${left} - ${right}`,
    };
  }

  const left = randomIntInRange(2, Math.max(3, Math.floor(config.maxOperand / 2)));
  const right = randomIntInRange(2, 9);
  const answer = left * right;

  return {
    answer,
    choices: buildChoices(answer),
    prompt: `${left} × ${right}`,
  };
}

function buildProblemSet(config: DifficultyConfig) {
  return Array.from({ length: config.problemCount }, () => buildProblem(config));
}

export function useQuickSumSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [problems, setProblems] = useState<QuickSumProblem[]>([]);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);

  useEffect(() => {
    setCurrentProblemIndex(0);
    setElapsedSeconds(0);
    setProblems([]);
    setState("idle");
    setWrongAnswerCount(0);
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
    setProblems(buildProblemSet(config));
    setState("playing");
    setWrongAnswerCount(0);
  }

  function answerProblem(value: number) {
    if (state !== "playing") {
      return "ignored";
    }

    const currentProblem = problems[currentProblemIndex];

    if (!currentProblem) {
      return "ignored";
    }

    const isCorrect = value === currentProblem.answer;

    if (!isCorrect) {
      setWrongAnswerCount((current) => current + 1);
    }

    const nextProblemIndex = currentProblemIndex + 1;

    if (nextProblemIndex >= problems.length) {
      setState("cleared");
      return isCorrect ? "correct" : "wrong";
    }

    setCurrentProblemIndex(nextProblemIndex);
    return isCorrect ? "correct" : "wrong";
  }

  return {
    answerProblem,
    beginRun,
    currentProblem: problems[currentProblemIndex] ?? null,
    currentProblemIndex,
    elapsedSeconds,
    problemCount: config.problemCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongAnswerCount,
  };
}
