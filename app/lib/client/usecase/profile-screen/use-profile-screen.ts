import { useEffect, useState } from "react";

type ThemePreference = "LIGHT" | "DARK";

type TrendPoint = {
  competitivePoints: number;
  gameName: string;
  index: number;
  label: string;
  status: string;
  totalPointsDelta: number;
};

type ProfileScreenInput = {
  profile: {
    themePreference: ThemePreference;
  };
  trend: TrendPoint[];
};

function buildTrendPath(points: TrendPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const values = points.map((point) => point.totalPointsDelta);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
      const y = 100 - (((point.totalPointsDelta - min) / range) * 100);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function useProfileScreen(input: ProfileScreenInput) {
  const [themePreference, setThemePreference] = useState<ThemePreference>(input.profile.themePreference);

  useEffect(() => {
    setThemePreference(input.profile.themePreference);
  }, [input.profile.themePreference]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.dataset.theme = themePreference === "DARK" ? "dark" : "light";
  }, [themePreference]);

  return {
    archivedTrend: input.trend.length > 3 ? input.trend.slice(0, -3).reverse() : [],
    handleThemePreferenceChange(nextValue: string) {
      setThemePreference(nextValue === "DARK" ? "DARK" : "LIGHT");
    },
    recentTrend: input.trend.slice(-3).reverse(),
    themePreference,
    trendPath: buildTrendPath(input.trend),
  };
}
