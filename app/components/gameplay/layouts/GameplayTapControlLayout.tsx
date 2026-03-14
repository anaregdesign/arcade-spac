import styles from "./GameplayTapControlLayout.module.css";
import { joinClassNames, toStyle, type StackLayoutProps } from "../../../lib/client/ui/gameplay-layout";

export function GameplayTapControlLayout({ children, className, gap, mobileGap }: StackLayoutProps) {
  return (
    <div
      className={joinClassNames(styles["layout-tap-control"], className)}
      style={toStyle({
        "--gameplay-layout-gap": gap,
        "--gameplay-layout-mobile-gap": mobileGap,
      })}
    >
      {children}
    </div>
  );
}
