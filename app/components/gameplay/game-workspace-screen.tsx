import { Form, Link, useNavigation } from "react-router";

import { useGameWorkspace } from "../../lib/client/usecase/game-workspace/use-game-workspace";

type GameWorkspaceScreenProps = {
  game: {
    key: string;
    name: string;
    shortDescription: string;
    rulesSummary: string;
    accentColor: string;
  };
};

export function GameWorkspaceScreen({ game }: GameWorkspaceScreenProps) {
  const navigation = useNavigation();
  const workspace = useGameWorkspace();

  return (
    <div className="dashboard-stack">
      <section className="feature-card workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{game.name}</p>
            <h2 className="section-title">{game.shortDescription}</h2>
          </div>
          <span className="status-badge" style={{ backgroundColor: `${game.accentColor}22`, color: game.accentColor }}>
            {workspace.isPlaying ? "Active run" : "Ready"}
          </span>
        </div>
        <p>{game.rulesSummary}</p>
        <label className="field-block">
          <span className="field-label">Difficulty</span>
          <select
            className="field-select"
            value={workspace.difficulty}
            onChange={(event) => workspace.changeDifficulty(event.currentTarget.value as "EASY" | "NORMAL" | "HARD" | "EXPERT")}
          >
            <option value="EASY">Easy</option>
            <option value="NORMAL">Normal</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>
        </label>
        <div className="hero-actions">
          <button className="action-link action-link-primary" type="button" onClick={() => workspace.beginRun()}>
            {workspace.isPlaying ? "Run in progress" : "Start run"}
          </button>
          <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("home")}>
            Leave for home
          </button>
          <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("rankings")}>
            Leave for rankings
          </button>
        </div>
      </section>

      <section className="feature-card workspace-card">
        <p className="eyebrow">Always-visible help</p>
        <h2 className="section-title">How this run behaves</h2>
        <ul className="detail-list">
          <li>Changing screens during an active run requires confirmation and records the run as abandoned.</li>
          <li>Pending-save results stay visible but do not count toward rankings until retried successfully.</li>
          <li>The result screen is the canonical place for replay, sharing, and game-switch actions.</li>
        </ul>
      </section>

      <section className="feature-card workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Resolve run</p>
            <h2 className="section-title">Simulate the next result state</h2>
          </div>
          <span className="status-badge status-badge-neutral">{navigation.state === "submitting" ? "Saving" : workspace.isPlaying ? "Ready to resolve" : "Start a run first"}</span>
        </div>
        <div className="hero-actions">
          <Form method="post" onSubmit={() => workspace.finishRun()}>
            <input type="hidden" name="intent" value="completeClean" />
            <input type="hidden" name="difficulty" value={workspace.difficulty} />
            <button className="action-link action-link-primary" disabled={!workspace.isPlaying} type="submit">
              Record clean clear
            </button>
          </Form>
          <Form method="post" onSubmit={() => workspace.finishRun()}>
            <input type="hidden" name="intent" value="completeSteady" />
            <input type="hidden" name="difficulty" value={workspace.difficulty} />
            <button className="action-link action-link-secondary" disabled={!workspace.isPlaying} type="submit">
              Record steady clear
            </button>
          </Form>
          <Form method="post" onSubmit={() => workspace.finishRun()}>
            <input type="hidden" name="intent" value="completePending" />
            <input type="hidden" name="difficulty" value={workspace.difficulty} />
            <button className="action-link action-link-secondary" disabled={!workspace.isPlaying} type="submit">
              Record pending save
            </button>
          </Form>
        </div>
      </section>

      {workspace.showLeaveConfirm ? (
        <section className="feature-card workspace-card confirm-card">
          <p className="eyebrow">Confirm leave</p>
          <h2 className="section-title">Leave the current run?</h2>
          <p>Leaving now records this run as abandoned and excludes it from rankings and total points.</p>
          <div className="hero-actions">
            <button className="action-link action-link-secondary" onClick={() => workspace.cancelLeaveConfirm()} type="button">
              Stay here
            </button>
            <Form method="post" onSubmit={() => workspace.finishRun()}>
              <input type="hidden" name="intent" value="abandon" />
              <input type="hidden" name="difficulty" value={workspace.difficulty} />
              <input type="hidden" name="redirectTo" value={workspace.targetDestination === "rankings" ? "/rankings" : "/home"} />
              <button className="action-link action-link-primary" type="submit">
                Confirm leave
              </button>
            </Form>
          </div>
        </section>
      ) : null}

      <div className="hero-actions">
        <Link className="action-link action-link-primary" to="/home">
          Back to home
        </Link>
        <Link className="action-link action-link-secondary" to="/rankings">
          Open rankings
        </Link>
      </div>
    </div>
  );
}