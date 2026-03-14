import styles from "./GameplayChoiceGrid.module.css";
import { joinClassNames, toStyle, type ChoiceGridLayoutProps } from "../../../lib/client/ui/gameplay-layout";

export function GameplayChoiceGrid({
  children,
  className,
  columns,
  gap,
  mobileColumns,
  mobileGap,
}: ChoiceGridLayoutProps) {
  return (
    <div
      className={joinClassNames(styles["layout-choice-grid"], className)}
      style={toStyle({
        "--gameplay-choice-columns": columns,
        "--gameplay-choice-gap": gap,
        "--gameplay-choice-mobile-columns": mobileColumns,
        "--gameplay-choice-mobile-gap": mobileGap,
      })}
    >
      {children}
    </div>
  );
}
