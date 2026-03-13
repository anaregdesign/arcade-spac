import { Link } from "react-router";

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
  const GameWorkspaceComponent = getGameWorkspaceComponent(game.key);
  const instructions = getGameInstructions(game.key);

  return (
    <div className="dashboard-stack workspace-stack">
      {GameWorkspaceComponent && instructions ? (
        <GameWorkspaceComponent instructions={instructions} workspace={workspace} />
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
    </div>
  );
}
