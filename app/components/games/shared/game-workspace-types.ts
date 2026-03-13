import type { GameWorkspaceController } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import type { GameInstructions } from "./game-instructions-dialog";

export type GameWorkspaceComponentProps = {
  instructions: GameInstructions;
  workspace: GameWorkspaceController;
};
