import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { readStoredHomeHubState, writeStoredHomeHubState } from "../../infrastructure/browser/home-hub-storage";
import { readWindowScrollY, restoreWindowScroll, subscribeWindowScroll } from "../../infrastructure/browser/window-scroll";
import { getGameHomeTags } from "../../../domain/entities/game-catalog";
import { toHomeGameCards } from "./selectors";

type HomeGame = {
  bestCompetitivePoints: number;
  completedCount: number;
  currentRank: number | null;
  isFavorite: boolean;
  key: string;
  metricLabel: string;
  metricValue: string;
  name: string;
  playCount: number;
  recommendationText: string | null;
  recommendationScore: number;
  shortDescription: string;
};

type HomeTagOption = {
  label: string;
  value: string;
};

const preferredTagOrder = [
  "fast-start",
  "audio",
  "logic",
  "timing",
  "memory",
  "perception",
  "reflex",
  "rhythm",
  "spatial",
  "played",
  "unplayed",
  "ranked",
] as const;

const tagLabelByValue: Record<string, string> = {
  audio: "Audio",
  "fast-start": "Fast start",
  logic: "Logic",
  memory: "Memory",
  perception: "Perception",
  played: "Played",
  ranked: "Ranked",
  reflex: "Reflex",
  rhythm: "Rhythm",
  spatial: "Spatial",
  timing: "Timing",
  unplayed: "Unplayed",
};

function getTagSetForGame(game: HomeGame) {
  const tags = ["all"];

  if (game.playCount === 0) {
    tags.push("unplayed");
  } else {
    tags.push("played");
  }

  if (game.currentRank) {
    tags.push("ranked");
  }

  tags.push(...getGameHomeTags(game.key));

  return tags;
}

function formatTagLabel(tag: string) {
  return tagLabelByValue[tag]
    ?? tag
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
}

function compareTagOrder(left: string, right: string) {
  const leftIndex = preferredTagOrder.indexOf(left as (typeof preferredTagOrder)[number]);
  const rightIndex = preferredTagOrder.indexOf(right as (typeof preferredTagOrder)[number]);

  if (leftIndex === -1 && rightIndex === -1) {
    return left.localeCompare(right);
  }

  if (leftIndex === -1) {
    return 1;
  }

  if (rightIndex === -1) {
    return -1;
  }

  return leftIndex - rightIndex;
}

function matchesSearch(game: HomeGame, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [
    game.name,
    game.shortDescription,
    game.recommendationText ?? "",
    ...getTagSetForGame(game),
  ].join(" ").toLowerCase();

  return haystack.includes(search.toLowerCase());
}

function computeLegacyHomeRecommendationScore(game: Pick<HomeGame, "bestCompetitivePoints" | "currentRank" | "playCount">) {
  return (game.playCount === 0 ? 1_000_000 : 0) + (game.currentRank ? 10_000 - game.currentRank : 0) + game.bestCompetitivePoints;
}

function compareGames(sort: string, left: HomeGame, right: HomeGame) {
  if (sort === "name") {
    return left.name.localeCompare(right.name);
  }

  if (sort === "recent") {
    return right.playCount - left.playCount || left.name.localeCompare(right.name);
  }

  if (sort === "rank") {
    const leftRank = left.currentRank ?? Number.POSITIVE_INFINITY;
    const rightRank = right.currentRank ?? Number.POSITIVE_INFINITY;
    return leftRank - rightRank || left.name.localeCompare(right.name);
  }

  const leftRecommendationScore = Number.isFinite(left.recommendationScore) ? left.recommendationScore : 0;
  const rightRecommendationScore = Number.isFinite(right.recommendationScore) ? right.recommendationScore : 0;
  const recommendationDelta = rightRecommendationScore - leftRecommendationScore;

  if (recommendationDelta !== 0) {
    return recommendationDelta;
  }

  const leftFallbackScore = computeLegacyHomeRecommendationScore(left);
  const rightFallbackScore = computeLegacyHomeRecommendationScore(right);
  return rightFallbackScore - leftFallbackScore || left.name.localeCompare(right.name);
}

function createSearchParams(input: { favoritesOnly: boolean; search: string; sort: string; tag: string }) {
  const next = new URLSearchParams();

  if (input.search) {
    next.set("q", input.search);
  }

  if (input.tag !== "all") {
    next.set("tag", input.tag);
  }

  if (input.sort !== "recommended") {
    next.set("sort", input.sort);
  }

  if (input.favoritesOnly) {
    next.set("favorites", "1");
  }

  return next;
}

export function useHomeHub(games: HomeGame[]) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [didAttemptRestore, setDidAttemptRestore] = useState(false);
  const [didRestoreScroll, setDidRestoreScroll] = useState(false);
  const [loadMoreTrigger, setLoadMoreTrigger] = useState<HTMLDivElement | null>(null);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const search = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "all";
  const sort = searchParams.get("sort") ?? "recommended";
  const favoritesOnly = searchParams.get("favorites") === "1";
  const dynamicTags = Array.from(
    new Set(
      games.flatMap((game) => getTagSetForGame(game))
        .filter((candidate) => candidate !== "all"),
    ),
  ).sort(compareTagOrder);
  const tagOptions: HomeTagOption[] = [
    { label: "All games", value: "all" },
    ...dynamicTags.map((candidate) => ({
      label: formatTagLabel(candidate),
      value: candidate,
    })),
  ];

  useEffect(() => {
    if (didAttemptRestore) {
      return;
    }

    setDidAttemptRestore(true);

    const hasExplicitState = searchParams.has("q") || searchParams.has("tag") || searchParams.has("sort") || searchParams.has("favorites");

    if (hasExplicitState) {
      return;
    }

    const stored = readStoredHomeHubState();

    if (!stored.search && stored.tag === "all" && stored.sort === "recommended" && !stored.favoritesOnly) {
      return;
    }

    const next = createSearchParams(stored);
    navigate(`/home?${next.toString()}`, { replace: true });
  }, [didAttemptRestore, navigate, searchParams]);

  useEffect(() => {
    const persist = () => {
      const scrollY = readWindowScrollY();

      if (scrollY > 0) {
        setHasScrolledDown(true);
      }

      writeStoredHomeHubState({
        favoritesOnly,
        scrollY,
        search,
        sort,
        tag,
      });
    };

    persist();
    return subscribeWindowScroll(persist);
  }, [favoritesOnly, search, sort, tag]);

  useEffect(() => {
    if (didRestoreScroll) {
      return;
    }

    const stored = readStoredHomeHubState();

    if (stored.search !== search || stored.sort !== sort || stored.tag !== tag || stored.favoritesOnly !== favoritesOnly || stored.scrollY <= 0) {
      setDidRestoreScroll(true);
      return;
    }

    setDidRestoreScroll(true);
    setHasScrolledDown(true);
    restoreWindowScroll(stored.scrollY);
  }, [didRestoreScroll, favoritesOnly, search, sort, tag]);

  useEffect(() => {
    setVisibleCount(6);
  }, [favoritesOnly, search, sort, tag]);

  const filteredGames = games
    .filter((game) => !favoritesOnly || game.isFavorite)
    .filter((game) => matchesSearch(game, search))
    .filter((game) => tag === "all" || getTagSetForGame(game).includes(tag))
    .sort((left, right) => compareGames(sort, left, right));
  const visibleGames = filteredGames.slice(0, visibleCount);
  const hasMore = filteredGames.length > visibleCount;

  useEffect(() => {
    if (!loadMoreTrigger || !hasMore || !hasScrolledDown || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (!isVisible) {
          return;
        }

        setVisibleCount((current) => {
          const nextCount = Math.min(current + 6, filteredGames.length);
          return nextCount === current ? current : nextCount;
        });
      },
      {
        rootMargin: "160px 0px",
      },
    );

    observer.observe(loadMoreTrigger);

    return () => {
      observer.disconnect();
    };
  }, [filteredGames.length, hasScrolledDown, loadMoreTrigger]);
 

  const highlightedGame = visibleGames[0] ?? null;
  const visibleGameCards = toHomeGameCards(visibleGames);

  return {
    clearFilters() {
      setSearchParams(createSearchParams({ favoritesOnly: false, search: "", sort: "recommended", tag: "all" }));
    },
    favoritesOnly,
    highlightedGame,
    hasMore,
    matchCount: filteredGames.length,
    loadMoreTriggerRef: setLoadMoreTrigger,
    search,
    showMore() {
      setVisibleCount((current) => current + 6);
    },
    setSearch(nextSearch: string) {
      setSearchParams(createSearchParams({ favoritesOnly, search: nextSearch, sort, tag }));
    },
    setSort(nextSort: string) {
      setSearchParams(createSearchParams({ favoritesOnly, search, sort: nextSort, tag }));
    },
    setTag(nextTag: string) {
      setSearchParams(createSearchParams({ favoritesOnly, search, sort, tag: nextTag }));
    },
    setFavoritesOnly(nextFavoritesOnly: boolean) {
      setSearchParams(createSearchParams({ favoritesOnly: nextFavoritesOnly, search, sort, tag }));
    },
    sort,
    sortOptions: [
      { label: "Recommended", value: "recommended" },
      { label: "Name", value: "name" },
      { label: "Recently played", value: "recent" },
      { label: "Best rank", value: "rank" },
    ],
    tag,
    tagOptions,
    visibleGameCards,
    visibleFavoriteCount: visibleGames.filter((game) => game.isFavorite).length,
  };
}
