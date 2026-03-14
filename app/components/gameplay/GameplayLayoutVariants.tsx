import type { CSSProperties, ReactNode } from "react";

import styles from "./GameplayLayoutVariants.module.css";

type LayoutClassProps = {
  children: ReactNode;
  className?: string;
};

type SidecarLayoutProps = LayoutClassProps & {
  desktopMain?: string;
  desktopSide?: string;
  desktopSideMin?: string;
  gap?: string;
  mobileGap?: string;
  mobileSideMin?: string;
  mobileSideMax?: string;
};

type ChoiceGridLayoutProps = LayoutClassProps & {
  columns?: number;
  gap?: string;
  mobileColumns?: number;
  mobileGap?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function toStyle(variables: Record<string, number | string | undefined>) {
  const style: Record<string, number | string> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      style[key] = value;
    }
  }

  return style as CSSProperties;
}

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

export function GameplayTwinPanelLayout({ children, className }: LayoutClassProps) {
  return <div className={joinClassNames(styles["layout-twin-panel"], className)}>{children}</div>;
}

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

export function gameplayMobileOrderClass(order: 1 | 2 | 3 | 4 | 5) {
  return styles[`mobile-order-${order}`];
}
