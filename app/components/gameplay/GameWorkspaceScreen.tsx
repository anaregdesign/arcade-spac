import { Link } from "react-router";

import { getGameInstructions, getGameWorkspaceComponent } from "../games/game-workspace-registry";
import { useAppLocale } from "../../lib/client/usecase/locale/use-app-locale";
import { FavoriteToggle } from "../shared/FavoriteToggle";
import { useGameWorkspace } from "../../lib/client/usecase/game-workspace/use-game-workspace";
import { GameplayShareAction } from "./workspace/GameplayShareAction";
import { GameWorkspaceRuntimeProvider } from "./workspace/game-workspace-runtime";
import styles from "./workspace/GameWorkspaceShared.module.css";

type GameWorkspaceScreenProps = {
  game: {
    key: string;
    name: string;
    shortDescription: string;
    rulesSummary: string;
    accentColor: string;
    isFavorite: boolean;
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
  const { locale } = useAppLocale();
  const workspace = useGameWorkspace();
  const GameWorkspaceComponent = getGameWorkspaceComponent(game.key);
  const instructions = getGameInstructions(game.key, locale);
  const instructionsActions = (
    <GameplayShareAction
      gameDescription={game.shortDescription}
      gameName={game.name}
    />
  );
  const toolbarActions = (
    <>
      <FavoriteToggle compact gameKey={game.key} gameName={game.name} isFavorite={game.isFavorite} />
      <button
        className={[
          "action-link",
          "action-link-secondary",
          !workspace.isPlaying ? "action-link-disabled" : "",
        ].filter(Boolean).join(" ")}
        disabled={!workspace.isPlaying}
        onClick={workspace.restartRun}
        type="button"
      >
        Restart
      </button>
    </>
  );

  return (
    <GameWorkspaceRuntimeProvider
      value={{
        autoStartRequest: workspace.autoStartRequest,
        instructionsActions,
        toolbarActions,
      }}
    >
      <div className={["dashboard-stack", styles["workspace-stack"]].join(" ")}>
        {GameWorkspaceComponent && instructions ? (
          <GameWorkspaceComponent key={`${game.key}:${workspace.sessionRevision}`} instructions={instructions} workspace={workspace} />
        ) : (
          <section className={["feature-card", styles["workspace-card"], "confirm-card"].join(" ")}>
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
    </GameWorkspaceRuntimeProvider>
  );
}
