import styles from "./GameplayTwinPanelLayout.module.css";
import { joinClassNames, type LayoutClassProps } from "../../../lib/client/ui/gameplay-layout";

export function GameplayTwinPanelLayout({ children, className }: LayoutClassProps) {
  return <div className={joinClassNames(styles["layout-twin-panel"], className)}>{children}</div>;
}
