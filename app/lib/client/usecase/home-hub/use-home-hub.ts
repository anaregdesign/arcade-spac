import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { readStoredHomeHubState, writeStoredHomeHubState } from "../../infrastructure/browser/home-hub-storage";

type HomeGame = {
  bestCompetitivePoints: number;
  completedCount: number;
  currentRank: number | null;
  key: string;
  metricLabel: string;
  metricValue: string;
  name: string;
  playCount: number;
  recommendationText: string | null;
  shortDescription: string;
};

type HomeTagOption = {
  label: string;
  value: string;
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

  if (game.key === "minesweeper") {
    tags.push("fast-start");
  }

  if (game.key === "sudoku") {
    tags.push("logic");
  }

  return tags;
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

  const leftScore = (left.playCount === 0 ? 1_000_000 : 0) + (left.currentRank ? 10_000 - left.currentRank : 0) + left.bestCompetitivePoints;
  const rightScore = (right.playCount === 0 ? 1_000_000 : 0) + (right.currentRank ? 10_000 - right.currentRank : 0) + right.bestCompetitivePoints;
  return rightScore - leftScore || left.name.localeCompare(right.name);
}

function createSearchParams(input: { search: string; sort: string; tag: string }) {
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

  return next;
}

export function useHomeHub(games: HomeGame[]) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const didAttemptRestoreRef = useRef(false);
  const didRestoreScrollRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const search = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "all";
  const sort = searchParams.get("sort") ?? "recommended";
  const tagOptions: HomeTagOption[] = [
    { label: "All games", value: "all" },
    { label: "Fast start", value: "fast-start" },
    { label: "Logic", value: "logic" },
    { label: "Played", value: "played" },
    { label: "Unplayed", value: "unplayed" },
    { label: "Ranked", value: "ranked" },
  ];

  useEffect(() => {
    if (didAttemptRestoreRef.current) {
      return;
    }

    didAttemptRestoreRef.current = true;

    const hasExplicitState = searchParams.has("q") || searchParams.has("tag") || searchParams.has("sort");

    if (hasExplicitState) {
      return;
    }

    const stored = readStoredHomeHubState();

    if (!stored.search && stored.tag === "all" && stored.sort === "recommended") {
      return;
    }

    const next = createSearchParams(stored);
    navigate(`/home?${next.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  useEffect(() => {
    const persist = () => {
      writeStoredHomeHubState({
        scrollY: typeof window === "undefined" ? 0 : window.scrollY,
        search,
        sort,
        tag,
      });
    };

    persist();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("scroll", persist, { passive: true });
    return () => window.removeEventListener("scroll", persist);
  }, [search, sort, tag]);

  useEffect(() => {
    if (didRestoreScrollRef.current || typeof window === "undefined") {
      return;
    }

    const stored = readStoredHomeHubState();

    if (stored.search !== search || stored.sort !== sort || stored.tag !== tag || stored.scrollY <= 0) {
      didRestoreScrollRef.current = true;
      return;
    }

    didRestoreScrollRef.current = true;
    window.requestAnimationFrame(() => window.scrollTo({ top: stored.scrollY, behavior: "auto" }));
  }, [search, sort, tag]);

  useEffect(() => {
    setVisibleCount(6);
  }, [search, sort, tag]);

  const filteredGames = games
    .filter((game) => matchesSearch(game, search))
    .filter((game) => tag === "all" || getTagSetForGame(game).includes(tag))
    .sort((left, right) => compareGames(sort, left, right));
  const visibleGames = filteredGames.slice(0, visibleCount);

  const highlightedGame = visibleGames[0] ?? null;

  return {
    clearFilters() {
      setSearchParams(createSearchParams({ search: "", sort: "recommended", tag: "all" }));
    },
    highlightedGame,
    hasMore: filteredGames.length > visibleCount,
    matchCount: filteredGames.length,
    search,
    showMore() {
      setVisibleCount((current) => current + 6);
    },
    setSearch(nextSearch: string) {
      setSearchParams(createSearchParams({ search: nextSearch, sort, tag }));
    },
    setSort(nextSort: string) {
      setSearchParams(createSearchParams({ search, sort: nextSort, tag }));
    },
    setTag(nextTag: string) {
      setSearchParams(createSearchParams({ search, sort, tag: nextTag }));
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
    visibleGames,
  };
}
