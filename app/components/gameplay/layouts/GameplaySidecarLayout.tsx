import styles from "./GameplaySidecarLayout.module.css";
import { joinClassNames, toStyle, type SidecarLayoutProps } from "../../../lib/client/ui/gameplay-layout";

export function GameplaySidecarLayout({
  children,
  className,
  desktopMain,
  desktopSide,
  desktopSideMin,
  gap,
  mobileGap,
  mobileSideMin,
  mobileSideMax,
}: SidecarLayoutProps) {
  return (
    <div
      className={joinClassNames(styles["layout-sidecar"], className)}
      style={toStyle({
        "--gameplay-layout-gap": gap,
        "--gameplay-layout-main-fr": desktopMain,
        "--gameplay-layout-mobile-gap": mobileGap,
        "--gameplay-layout-mobile-side-max": mobileSideMax,
        "--gameplay-layout-mobile-side-min": mobileSideMin,
        "--gameplay-layout-side-fr": desktopSide,
        "--gameplay-layout-side-min": desktopSideMin,
      })}
    >
      {children}
    </div>
  );
}
