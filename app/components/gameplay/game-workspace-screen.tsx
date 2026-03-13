import { Form, Link } from "react-router";

import { buildAlternateGameLinks } from "../../lib/domain/entities/game-catalog";
import { getGameInstructions, getGameWorkspaceComponent } from "../games/game-workspace-registry";
import { useGameWorkspace } from "../../lib/client/usecase/game-workspace/use-game-workspace";

type GameWorkspaceScreenProps = {
  game: {
    key: string;
    name: string;
    shortDescription: string;
    rulesSummary: string;
    accentColor: string;
    standing: {
      bestCompetitivePoints: number;
      currentRank: number | null;
      personalBestMetric: number | null;
      playCount: number;
      seasonPoints: number;
      seasonRank: number | null;
    };
  };
};

export function GameWorkspaceScreen({ game }: GameWorkspaceScreenProps) {
  const workspace = useGameWorkspace();
  const alternateGames = buildAlternateGameLinks(game.key);
  const GameWorkspaceComponent = getGameWorkspaceComponent(game.key);
  const instructions = getGameInstructions(game.key);

  return (
    <div className="dashboard-stack workspace-stack">
      {GameWorkspaceComponent && instructions ? (
        <GameWorkspaceComponent alternateGames={alternateGames} instructions={instructions} workspace={workspace} />
      ) : (
        <section className="feature-card workspace-card confirm-card">
          <p className="eyebrow">Game setup</p>
          <h2 className="section-title">{game.name} is not registered yet</h2>
          <p className="compact-copy">
            Add a game-specific workspace Component under
            {" "}
            <code>{`app/components/games/${game.key}/`}</code>
            {" "}
            and register it in the game workspace registry.
          </p>
          <div className="hero-actions compact-action-strip">
            <Link className="action-link action-link-primary" to="/home">
              Back to home
            </Link>
          </div>
        </section>
      )}

      {workspace.showLeaveConfirm ? (
        <section className="feature-card workspace-card confirm-card">
          <p className="eyebrow">Leave run</p>
          <h2 className="section-title">Leave the current run?</h2>
          <p className="compact-copy">Leaving now records this attempt as abandoned and excludes it from rankings and total points.</p>
          <div className="hero-actions compact-action-strip">
            <button className="action-link action-link-secondary" onClick={() => workspace.cancelLeaveConfirm()} type="button">
              Stay here
            </button>
            <Form method="post" onSubmit={() => workspace.finishRun()}>
              <input type="hidden" name="intent" value="abandon" />
              <input type="hidden" name="difficulty" value={workspace.difficulty} />
              <input type="hidden" name="redirectTo" value={workspace.targetDestination ?? "/home"} />
              <button className="action-link action-link-primary" type="submit">
                Confirm leave
              </button>
            </Form>
          </div>
        </section>
      ) : null}
    </div>
  );
}
