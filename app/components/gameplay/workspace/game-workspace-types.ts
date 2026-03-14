import type { GameWorkspaceController } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import type { GameInstructions } from "./GameInstructionsDialog";

export type GameWorkspaceComponentProps = {
  instructions: GameInstructions;
  workspace: GameWorkspaceController;
};
