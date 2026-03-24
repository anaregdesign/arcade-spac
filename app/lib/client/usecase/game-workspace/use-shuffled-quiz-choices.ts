import { useEffect, useMemo, useState } from "react";

import { shuffleValues } from "./game-utils";

type ChoiceWithKey = {
  key: string;
};

export function createShuffledChoiceOrder<T extends ChoiceWithKey>(choices: readonly T[], enabled = true) {
  const keys = choices.map((choice) => choice.key);

  return enabled ? shuffleValues(keys) : [...keys];
}

export function applyChoiceOrder<T extends ChoiceWithKey>(choices: readonly T[], choiceOrder: readonly string[]) {
  const choiceMap = new Map(choices.map((choice) => [choice.key, choice]));
  const orderedChoices = choiceOrder
    .map((key) => choiceMap.get(key))
    .filter((choice): choice is T => Boolean(choice));

  if (orderedChoices.length === choices.length) {
    return orderedChoices;
  }

  return [...choices];
}

export function useShuffledQuizChoices<T extends ChoiceWithKey>(choices: readonly T[], scopeKey: string, enabled = true) {
  const choiceKeysSignature = useMemo(() => choices.map((choice) => choice.key).join("\u0000"), [choices]);
  const [choiceOrder, setChoiceOrder] = useState(() => createShuffledChoiceOrder(choices, enabled));

  useEffect(() => {
    setChoiceOrder(createShuffledChoiceOrder(choices, enabled));
  }, [choiceKeysSignature, choices, enabled, scopeKey]);

  return useMemo(() => applyChoiceOrder(choices, choiceOrder), [choiceOrder, choices]);
}