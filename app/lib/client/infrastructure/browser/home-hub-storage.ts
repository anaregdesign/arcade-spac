const HOME_HUB_STORAGE_KEY = "arcade:home-hub-state";

export type StoredHomeHubState = {
  favoritesOnly: boolean;
  scrollY: number;
  search: string;
  sort: string;
  tag: string;
};

const defaultHomeHubState: StoredHomeHubState = {
  favoritesOnly: false,
  scrollY: 0,
  search: "",
  sort: "recommended",
  tag: "all",
};

export function readStoredHomeHubState() {
  if (typeof window === "undefined") {
    return defaultHomeHubState;
  }

  const raw = window.sessionStorage.getItem(HOME_HUB_STORAGE_KEY);

  if (!raw) {
    return defaultHomeHubState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredHomeHubState>;

    return {
      favoritesOnly: parsed.favoritesOnly === true,
      scrollY: typeof parsed.scrollY === "number" ? parsed.scrollY : 0,
      search: typeof parsed.search === "string" ? parsed.search : "",
      sort: typeof parsed.sort === "string" ? parsed.sort : "recommended",
      tag: typeof parsed.tag === "string" ? parsed.tag : "all",
    };
  } catch {
    return defaultHomeHubState;
  }
}

export function writeStoredHomeHubState(state: StoredHomeHubState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(HOME_HUB_STORAGE_KEY, JSON.stringify(state));
}
