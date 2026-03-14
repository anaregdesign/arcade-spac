import { useCallback } from "react";
import { useNavigation, useSubmit } from "react-router";

import { createFormDataFromEntries } from "../../infrastructure/browser/form-data";
import { toGameplayResultFormEntries, type GameplayResultSubmission } from "./form-data";

export function useGameplayResultSubmitter() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submitResult = useCallback((input: GameplayResultSubmission) => {
    submit(createFormDataFromEntries(toGameplayResultFormEntries(input)), { method: "post" });
  }, [submit]);

  return {
    isSubmitting: navigation.state === "submitting",
    submitResult,
  };
}
