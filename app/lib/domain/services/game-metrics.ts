import { getGameDefinition, toRouteGameKey } from "../entities/game-catalog";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function normalizeGameKey(gameKey: string) {
  return toRouteGameKey(gameKey);
}

function getNormalizedGameDefinition(gameKey: string) {
  return getGameDefinition(normalizeGameKey(gameKey));
}

export function formatPrimaryMetric(gameKey: string, primaryMetric: number) {
  const definition = getNormalizedGameDefinition(gameKey);

  if (definition?.primaryMetric.format === "offset_px") {
    return `${primaryMetric} px`;
  }

  return formatDuration(primaryMetric);
}

export function formatOptionalPrimaryMetric(gameKey: string, primaryMetric: number | null) {
  if (primaryMetric === null) {
    return "No record yet";
  }

  return formatPrimaryMetric(gameKey, primaryMetric);
}

export function getBestMetricLabel(gameKey: string) {
  return getNormalizedGameDefinition(gameKey)?.primaryMetric.bestLabel ?? "Best record";
}

export function getResultPrimaryMetricLabel(gameKey: string, status: string) {
  const definition = getNormalizedGameDefinition(gameKey);

  if (!definition) {
    return status === "FAILED" || status === "ABANDONED" ? "Run time" : "Clear time";
  }

  return status === "FAILED" || status === "ABANDONED"
    ? definition.primaryMetric.failedLabel
    : definition.primaryMetric.completedLabel;
}

export function comparePrimaryMetrics(gameKey: string, left: number, right: number) {
  const definition = getNormalizedGameDefinition(gameKey);

  if (!definition || definition.primaryMetric.direction === "lower-better") {
    return left - right;
  }

  return right - left;
}

export function buildPrimaryMetricShareLine(gameKey: string, input: {
  difficulty: string;
  gameName: string;
  primaryMetricText: string;
}) {
  const definition = getNormalizedGameDefinition(gameKey);

  if (definition?.primaryMetric.format === "offset_px") {
    return `Arcade: ${input.gameName} ${input.difficulty.toLowerCase()} at ${input.primaryMetricText} offset.`;
  }

  return `Arcade: ${input.gameName} ${input.difficulty.toLowerCase()} in ${input.primaryMetricText}.`;
}

export function getDropLineHitRating(primaryMetric: number, status: string) {
  if (status === "FAILED" || status === "ABANDONED") {
    return {
      note: "The ball passed the line before the hit registered.",
      value: "Miss",
    };
  }

  if (primaryMetric <= 4) {
    return {
      note: "Within 4 px of the line center.",
      value: "Perfect",
    };
  }

  if (primaryMetric <= 10) {
    return {
      note: "A tight hit with a small visible offset.",
      value: "Precise",
    };
  }

  if (primaryMetric <= 22) {
    return {
      note: "Close enough to score well, with room to tighten the timing.",
      value: "Close",
    };
  }

  return {
    note: "The hit landed, but the timing window was visibly off the line center.",
    value: "Wide",
  };
}
