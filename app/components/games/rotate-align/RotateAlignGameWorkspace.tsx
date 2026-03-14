import type { RotateAlignCell } from "../../../lib/client/usecase/game-workspace/use-rotate-align-session";
import { useRotateAlignWorkspace } from "../../../lib/client/usecase/game-workspace/use-rotate-align-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./RotateAlignGameWorkspace.module.css";

function connectorClassName(direction: string) {
  if (direction === "north") {
    return styles["route-segment-north"];
  }

  if (direction === "east") {
    return styles["route-segment-east"];
  }

  if (direction === "south") {
    return styles["route-segment-south"];
  }

  return styles["route-segment-west"];
}

function serializeConnectors(connectors: readonly string[]) {
  const order = ["north", "east", "south", "west"];

  return [...connectors].sort((left, right) => order.indexOf(left) - order.indexOf(right)).join("-");
}

function getCurrentConnectors(cell: RotateAlignCell) {
  const directionOrder = ["north", "east", "south", "west"] as const;
  const canonicalConnectorsByShape = {
    corner: ["east", "south"],
    empty: [],
    end: ["east"],
    straight: ["east", "west"],
  } as const;

  return canonicalConnectorsByShape[cell.shape].map((direction) => {
    const currentIndex = directionOrder.indexOf(direction);

    return directionOrder[(currentIndex + cell.currentRotation + directionOrder.length * 4) % directionOrder.length];
  });
}

function Tile({
  cell,
  onPress,
}: {
  cell: RotateAlignCell;
  onPress?: (rowIndex: number, columnIndex: number) => void;
}) {
  const connectors = getCurrentConnectors(cell);
  const sharedProps = {
    "data-column": cell.columnIndex,
    "data-current-connectors": serializeConnectors(connectors),
    "data-empty": cell.shape === "empty" ? "true" : "false",
    "data-end": cell.isEnd ? "true" : "false",
    "data-rotate-align-cell": "true",
    "data-rotation": cell.currentRotation,
    "data-row": cell.rowIndex,
    "data-shape": cell.shape,
    "data-solution-connectors": serializeConnectors(cell.solutionConnectors),
    "data-start": cell.isStart ? "true" : "false",
  };

  const content = (
    <>
      <span className={styles["route-core"]} />
      {connectors.map((direction) => (
        <span className={[styles["route-segment"], connectorClassName(direction)].join(" ")} key={`${cell.id}-${direction}`} />
      ))}
      {cell.isStart ? <span className={[styles["route-marker"], styles["route-marker-start"]].join(" ")}>S</span> : null}
      {cell.isEnd ? <span className={[styles["route-marker"], styles["route-marker-end"]].join(" ")}>E</span> : null}
    </>
  );

  if (cell.shape === "empty") {
    return (
      <span
        aria-hidden="true"
        className={[styles["route-tile"], styles["route-tile-empty"]].join(" ")}
        key={cell.id}
        {...sharedProps}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      aria-label={`Rotate tile ${cell.rowIndex + 1}-${cell.columnIndex + 1} ${cell.shape}${cell.isStart ? " start" : ""}${cell.isEnd ? " end" : ""}`}
      className={styles["route-tile"]}
      key={cell.id}
      onClick={() => onPress?.(cell.rowIndex, cell.columnIndex)}
      type="button"
      {...sharedProps}
    >
      {content}
    </button>
  );
}

export function RotateAlignGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useRotateAlignWorkspace(workspace);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={<GameInstructionsDialog instructions={instructions} />}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">
              Round {screen.rotateAlign.currentRoundIndex + 1}/{screen.rotateAlign.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">Rotations {screen.rotateAlign.rotationCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["route-workspace-card"]].join(" ")} aria-label="Rotate Align board">
        <div className={[styles["route-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["route-copy"]}>
            <p className="eyebrow">Reconnect the route</p>
            <strong>Rotate one tile at a time until the line runs from S to E.</strong>
            <p className="compact-copy">
              Each tap rotates one route tile 90 degrees clockwise. Empty tiles are inert, and the round clears as soon as the full path is continuous.
            </p>
          </div>
          <div
            className={styles["route-board"]}
            style={{ gridTemplateColumns: `repeat(${screen.rotateAlign.columnCount}, minmax(0, 1fr))` }}
          >
            {screen.rotateAlign.board.flatMap((row) =>
              row.map((cell) => (
                <Tile cell={cell} key={cell.id} onPress={screen.handleTilePress} />
              )),
            )}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Rotate the path tiles clockwise until the route connects the start marker to the end marker."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Route sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
