import type { CSSProperties, ReactNode } from "react";

export type LayoutClassProps = {
  children: ReactNode;
  className?: string;
};

export type StackLayoutProps = LayoutClassProps & {
  gap?: string;
  mobileGap?: string;
};

export type SidecarLayoutProps = LayoutClassProps & {
  desktopMain?: string;
  desktopSide?: string;
  desktopSideMin?: string;
  gap?: string;
  mobileGap?: string;
  mobileSideMin?: string;
  mobileSideMax?: string;
};

export type ChoiceGridLayoutProps = LayoutClassProps & {
  columns?: number;
  gap?: string;
  mobileColumns?: number;
  mobileGap?: string;
};

export function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function toStyle(variables: Record<string, number | string | undefined>) {
  const style: Record<string, number | string> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      style[key] = value;
    }
  }

  return style as CSSProperties;
}
