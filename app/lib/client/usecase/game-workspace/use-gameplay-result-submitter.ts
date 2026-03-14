import { useCallback } from "react";
import { useNavigation, useSubmit } from "react-router";

import { createGameplayResultFormData, type GameplayResultSubmission } from "./form-data";

export function useGameplayResultSubmitter() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submitResult = useCallback((input: GameplayResultSubmission) => {
    submit(createGameplayResultFormData(input), { method: "post" });
  }, [submit]);

  return {
    isSubmitting: navigation.state === "submitting",
    submitResult,
  };
}
