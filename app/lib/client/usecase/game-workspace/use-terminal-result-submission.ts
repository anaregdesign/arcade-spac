import { useEffect, useRef } from "react";

import type { GameWorkspaceController } from "./use-game-workspace";
import { useGameplayResultSubmitter } from "./use-gameplay-result-submitter";
import type { GameplayResultSubmission } from "./form-data";

type TerminalOutcome = "cleared" | "failed";

export function useTerminalResultSubmission(input: {
  outcome: TerminalOutcome | null;
  submission: GameplayResultSubmission | null;
  workspace: Pick<GameWorkspaceController, "finishRun">;
}) {
  const submittedOutcomeRef = useRef<TerminalOutcome | null>(null);
  const { isSubmitting, submitResult } = useGameplayResultSubmitter();

  useEffect(() => {
    if (!input.outcome || !input.submission) {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === input.outcome) {
      return;
    }

    submittedOutcomeRef.current = input.outcome;
    input.workspace.finishRun();
    submitResult(input.submission);
  }, [input.outcome, input.submission, input.workspace, submitResult]);

  return { isSubmitting };
}
