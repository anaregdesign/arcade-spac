import styles from "./GameplaySequenceStageLayout.module.css";
import { joinClassNames, toStyle, type StackLayoutProps } from "../../../lib/client/ui/gameplay-layout";

export function GameplaySequenceStageLayout({ children, className, gap, mobileGap }: StackLayoutProps) {
  return (
    <div
      className={joinClassNames(styles["layout-sequence-stage"], className)}
      style={toStyle({
        "--gameplay-layout-gap": gap,
        "--gameplay-layout-mobile-gap": mobileGap,
      })}
    >
      {children}
    </div>
  );
}
