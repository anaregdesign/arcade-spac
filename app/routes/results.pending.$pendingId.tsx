import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/results.pending.$pendingId";
import { AppShell } from "../components/app-shell";
import { ResultScreen } from "../components/gameplay/result-screen";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { clearPendingResultDraft, commitSession, getPendingResultDraft, getSession, requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard, getGameWorkspace } from "../lib/server/usecase/get-home-dashboard.server";
import { buildPendingResultDraftView } from "../lib/server/usecase/gameplay/get-result-view.server";
import { recordGameplayResult } from "../lib/server/usecase/gameplay/record-gameplay-result.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  const session = await getSession(request);
  const draft = getPendingResultDraft(session);

  if (!draft || draft.id !== params.pendingId) {
    throw new Response("Pending result not found", { status: 404 });
  }

  if (draft.ownerUserId && draft.ownerUserId !== userId) {
    throw new Response("Pending result is not available for this user", { status: 403 });
  }

  const [dashboard, game] = await Promise.all([
    getHomeDashboard(userId),
    getGameWorkspace(draft.gameKey),
  ]);

  return {
    dashboard,
    result: buildPendingResultDraftView({
      draft,
      gameName: game.name,
    }),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireCurrentUserId(request);
  const session = await getSession(request);
  const draft = getPendingResultDraft(session);
  const formData = await request.formData();

  if (!draft || draft.id !== params.pendingId) {
    throw new Response("Pending result not found", { status: 404 });
  }

  if (draft.ownerUserId && draft.ownerUserId !== userId) {
    throw new Response("Pending result is not available for this user", { status: 403 });
  }

  if (formData.get("intent") === "retryPending") {
    const resultId = await recordGameplayResult({
      userId,
      gameKey: draft.gameKey,
      difficulty: draft.difficulty,
      outcome: draft.outcome,
      actualMetrics: draft.actualMetrics,
    });

    clearPendingResultDraft(session);

    return redirect(`/results/${resultId}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (formData.get("intent") === "discardPending") {
    clearPendingResultDraft(session);

    return redirect("/home", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  throw new Response("Unsupported action", { status: 400 });
}

export default function PendingResultRoute() {
  const { dashboard, result } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="games"
      help={{
        intro: "Pending recovery keeps a clear available until the app can publish it to rankings and total points again.",
        sections: buildSharedHelpSections([
          {
            eyebrow: "5. Recovery flow",
            title: "Retry publishing after a save problem or session expiry",
            body: "The run detail stays visible here, but leaderboard impact and Teams sharing remain locked until retry succeeds.",
          },
        ]),
        title: "Pending result help",
        triggerLabel: "Help",
      }}
      sectionLabel="Pending result"
      title={`${result.gameName} pending result`}
      user={dashboard.user}
    >
      <ResultScreen result={result} />
      <section className="feature-card workspace-card">
        <div className="hero-actions compact-action-strip">
          <form method="post">
            <input type="hidden" name="intent" value="discardPending" />
            <button className="action-link action-link-secondary" type="submit">
              Discard recovery draft
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
