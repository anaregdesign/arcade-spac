import { Children, Fragment, isValidElement, type ReactNode } from "react";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import { useGameWorkspaceRuntime } from "./game-workspace-runtime";
import styles from "./GameWorkspaceShared.module.css";

const difficultyOptions: Array<{ label: string; value: GameDifficulty }> = [
  { label: "Easy", value: "EASY" },
  { label: "Normal", value: "NORMAL" },
  { label: "Hard", value: "HARD" },
  { label: "Expert", value: "EXPERT" },
];

type GameWorkspaceControlsCardProps = {
  difficulty: GameDifficulty;
  isDifficultyDisabled: boolean;
  onDifficultyChange: (nextDifficulty: GameDifficulty) => void;
  primaryActions: ReactNode;
  statusChips: ReactNode;
};

type ParsedStatusItem = {
  key: string;
  kind: "metric" | "state";
  label: string;
  value: string;
};

const knownStatusPrefixes = [
  "Triggers left",
  "Wrong answers",
  "Wrong cells",
  "Wrong taps",
  "Max combo",
  "Bad shots",
  "Active pair",
  "Best cascade",
  "Last bounces",
  "False taps",
  "Current speed",
  "Perfect passes",
  "Last action",
  "Gap lane",
  "Perfect",
  "Selected",
  "Problem",
  "Mismatch",
  "Rotations",
  "Misses",
  "Target",
  "Round",
  "Found",
  "Moves",
  "Walls",
  "Speed",
  "Board",
  "Phase",
  "Cycle",
  "Range",
  "Shots",
  "Hints",
  "Flips",
  "Swaps",
  "Scene",
  "Path",
  "Goal",
  "Time",
  "Left",
  "Open",
  "Last",
  "Lane",
  "Hits",
  "Max",
].sort((left, right) => right.length - left.length);

const compactStatusLabels: Record<string, string> = {
  "Active pair": "Pair",
  "Best cascade": "Cascade",
  "Current speed": "Speed",
  "False taps": "False",
  "Gap lane": "Gap",
  "Last bounces": "Bounces",
  Left: "Time",
  "Max combo": "Max",
  "Perfect passes": "Perfect",
  Selected: "Piece",
  "Triggers left": "Triggers",
  "Wrong cells": "Wrong",
  "Wrong answers": "Wrong",
  "Wrong taps": "Wrong",
};

const unitSuffixes = new Set(["ms", "px", "px/s"]);

const stateLikeValues = new Set([
  "answering",
  "cleared",
  "clue board",
  "comparing",
  "crashed",
  "live",
  "locking",
  "out of triggers",
  "overloaded",
  "packing",
  "place",
  "planning",
  "propagating",
  "ready",
  "review",
  "rushing",
  "solved",
  "timed out",
  "watch",
  "watching",
]);

const hiddenStateValues = new Set(["planning", "ready", "review", "watch", "watching"]);

function collectTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((item) => collectTextContent(item)).join(" ");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return collectTextContent(node.props.children);
  }

  return "";
}

function collectStatusTexts(node: ReactNode): string[] {
  if (Array.isArray(node)) {
    return node.flatMap((item) => collectStatusTexts(item));
  }

  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) {
    return Children.toArray(node.props.children).flatMap((item) => collectStatusTexts(item));
  }

  const text = collectTextContent(node).replace(/\s+/g, " ").trim();

  return text ? [text] : [];
}

function parseStatusText(text: string, index: number): ParsedStatusItem | null {
  const normalized = text.replace(/\s+/g, " ").trim().replace(/\s*\/\s*/g, "/");

  if (!normalized) {
    return null;
  }

  const lowercase = normalized.toLowerCase();

  if (stateLikeValues.has(lowercase)) {
    return { key: `status-${index}`, kind: "state", label: "State", value: normalized };
  }

  const matchedPrefix = knownStatusPrefixes.find((prefix) => normalized.startsWith(`${prefix} `));

  if (matchedPrefix) {
    return {
      key: `status-${index}`,
      kind: matchedPrefix === "State" ? "state" : "metric",
      label: compactStatusLabels[matchedPrefix] ?? matchedPrefix,
      value: normalized.slice(matchedPrefix.length).trim(),
    };
  }

  const words = normalized.split(" ");
  const lastWord = words.at(-1) ?? "";
  const secondLastWord = words.at(-2) ?? "";

  if (words.length === 2) {
    return {
      key: `status-${index}`,
      kind: "metric",
      label: compactStatusLabels[words[0]] ?? words[0],
      value: words[1],
    };
  }

  if (
    words.length >= 3 &&
    unitSuffixes.has(lastWord.toLowerCase()) &&
    (/^[#]?\d/.test(secondLastWord) || /^[\d:./%-]+[a-z%]*$/i.test(secondLastWord))
  ) {
    const label = words.slice(0, -2).join(" ");

    return {
      key: `status-${index}`,
      kind: "metric",
      label: compactStatusLabels[label] ?? label,
      value: `${secondLastWord} ${lastWord}`,
    };
  }

  if (/^[#]?\d/.test(lastWord) || /^[\d:./%-]+[a-z%]*$/i.test(lastWord) || lastWord.length <= 2) {
    const label = words.slice(0, -1).join(" ");

    return {
      key: `status-${index}`,
      kind: "metric",
      label: compactStatusLabels[label] ?? label,
      value: lastWord,
    };
  }

  return { key: `status-${index}`, kind: "state", label: "State", value: normalized };
}

function parseStatusItems(statusChips: ReactNode) {
  return collectStatusTexts(statusChips)
    .map((text, index) => parseStatusText(text, index))
    .filter((item): item is ParsedStatusItem => item !== null);
}

function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase();

  return normalized === "" || normalized === "n/a" || normalized === "none" || /^[\s\-—–]+$/.test(normalized);
}

function shouldDisplayStatusItem(item: ParsedStatusItem) {
  if (isPlaceholderValue(item.value)) {
    return false;
  }

  if (item.kind === "state" && hiddenStateValues.has(item.value.trim().toLowerCase())) {
    return false;
  }

  return true;
}

export function GameWorkspaceControlsCard({
  difficulty,
  isDifficultyDisabled,
  onDifficultyChange,
  primaryActions,
  statusChips,
}: GameWorkspaceControlsCardProps) {
  const statusItems = parseStatusItems(statusChips).filter((item) => shouldDisplayStatusItem(item));
  const runtime = useGameWorkspaceRuntime();

  return (
    <section className={["feature-card", styles["workspace-card"], styles["workspace-controls-card"]].join(" ")}>
      <div className={[styles["workspace-toolbar"], styles["workspace-toolbar-minimal"]].join(" ")}>
        <label className={["field-block", styles["workspace-toolbar-field"]].join(" ")}>
          <span className={["field-label", styles["workspace-visually-hidden"]].join(" ")}>Difficulty</span>
          <select
            aria-label="Difficulty"
            className="field-select"
            value={difficulty}
            disabled={isDifficultyDisabled}
            onChange={(event) => onDifficultyChange(event.currentTarget.value as GameDifficulty)}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={["hero-actions", "compact-actions", styles["workspace-primary-actions"]].join(" ")}>
          {primaryActions}
          {runtime.toolbarActions}
        </div>
        {statusItems.length > 0 ? (
          <dl className={styles["workspace-status-grid"]} aria-label="Run status">
            {statusItems.map((item) => (
              <div className={styles["workspace-status-item"]} data-kind={item.kind} key={item.key}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
