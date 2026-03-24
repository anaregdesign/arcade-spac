import type { SupportedArcadeLocale } from "../../../domain/entities/locale";

type HomeHubCopy = {
  allGamesLabel: string;
  discoveryControlsLabel: string;
  emptyFavoritesBody: string;
  emptyFavoritesTitle: string;
  emptySearchBody: string;
  emptySearchTitle: string;
  favoritesLabel: string;
  favoritesOnlyLabel: string;
  filterLabel: string;
  firstRunLabel: string;
  helpIntro: string;
  helpTitle: string;
  nameSortLabel: string;
  noRecordYetLabel: string;
  openRankingsLabel: string;
  recentSortLabel: string;
  recommendedSortLabel: string;
  resetFiltersLabel: string;
  savedBadgeLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  sectionLabel: string;
  showMoreGamesLabel: string;
  sortLabel: string;
  title: string;
  rankSortLabel: string;
};

const copyByLocale: Record<SupportedArcadeLocale, HomeHubCopy> = {
  en: {
    allGamesLabel: "All games",
    discoveryControlsLabel: "Game discovery controls",
    emptyFavoritesBody: "Try a broader search or turn off Favorites only so the full catalog comes back into view.",
    emptyFavoritesTitle: "No favorite games match this view",
    emptySearchBody: "Try a broader search or switch the filter so the game grid can come back into view.",
    emptySearchTitle: "No games match this search",
    favoritesLabel: "Favorites",
    favoritesOnlyLabel: "Favorites only",
    filterLabel: "Filter",
    firstRunLabel: "First run",
    helpIntro: "Open help when you need a reminder about game choice, total points, rankings, or run states.",
    helpTitle: "Arcade help",
    nameSortLabel: "Name",
    noRecordYetLabel: "No record yet",
    openRankingsLabel: "Open rankings",
    rankSortLabel: "Best rank",
    recentSortLabel: "Recently played",
    recommendedSortLabel: "Recommended",
    resetFiltersLabel: "Reset filters",
    savedBadgeLabel: "Saved",
    searchLabel: "Search",
    searchPlaceholder: "Find a game or style",
    sectionLabel: "Play hub",
    showMoreGamesLabel: "Show more games",
    sortLabel: "Sort",
    title: "Choose your next game",
  },
  ja: {
    allGamesLabel: "すべてのゲーム",
    discoveryControlsLabel: "ゲーム検索コントロール",
    emptyFavoritesBody: "検索条件を広げるか、「お気に入りのみ」をオフにすると全カタログに戻れます。",
    emptyFavoritesTitle: "この条件に一致するお気に入りはありません",
    emptySearchBody: "検索条件を広げるか、絞り込みを切り替えてゲーム一覧を見直してください。",
    emptySearchTitle: "この検索条件に一致するゲームはありません",
    favoritesLabel: "お気に入り",
    favoritesOnlyLabel: "お気に入りのみ",
    filterLabel: "絞り込み",
    firstRunLabel: "初回プレイ",
    helpIntro: "ゲーム選び、総合ポイント、ランキング、プレイ状態を確認したいときは遊び方を開いてください。",
    helpTitle: "Arcade のヘルプ",
    nameSortLabel: "名前順",
    noRecordYetLabel: "記録なし",
    openRankingsLabel: "ランキングを見る",
    rankSortLabel: "最高順位",
    recentSortLabel: "最近プレイ",
    recommendedSortLabel: "おすすめ",
    resetFiltersLabel: "絞り込みをリセット",
    savedBadgeLabel: "保存済み",
    searchLabel: "検索",
    searchPlaceholder: "ゲーム名やスタイルで探す",
    sectionLabel: "ゲームハブ",
    showMoreGamesLabel: "さらに表示",
    sortLabel: "並び替え",
    title: "次のゲームを選ぶ",
  },
  zh: {
    allGamesLabel: "全部游戏",
    discoveryControlsLabel: "游戏筛选控件",
    emptyFavoritesBody: "请扩大搜索范围，或关闭“仅看收藏”，让完整目录重新显示。",
    emptyFavoritesTitle: "当前视图中没有匹配的收藏游戏",
    emptySearchBody: "请扩大搜索范围，或切换筛选条件，让游戏列表重新显示。",
    emptySearchTitle: "没有游戏符合当前搜索条件",
    favoritesLabel: "收藏",
    favoritesOnlyLabel: "仅看收藏",
    filterLabel: "筛选",
    firstRunLabel: "首次游玩",
    helpIntro: "当你需要重新确认游戏选择、总积分、排行榜或游玩状态时，请打开玩法说明。",
    helpTitle: "Arcade 帮助",
    nameSortLabel: "名称",
    noRecordYetLabel: "暂无记录",
    openRankingsLabel: "查看排行榜",
    rankSortLabel: "最佳排名",
    recentSortLabel: "最近游玩",
    recommendedSortLabel: "推荐",
    resetFiltersLabel: "重置筛选",
    savedBadgeLabel: "已收藏",
    searchLabel: "搜索",
    searchPlaceholder: "按游戏或类型查找",
    sectionLabel: "游戏中心",
    showMoreGamesLabel: "显示更多游戏",
    sortLabel: "排序",
    title: "选择下一款游戏",
  },
  fr: {
    allGamesLabel: "Tous les jeux",
    discoveryControlsLabel: "Commandes de découverte des jeux",
    emptyFavoritesBody: "Essayez une recherche plus large ou désactivez le filtre des favoris pour retrouver tout le catalogue.",
    emptyFavoritesTitle: "Aucun favori ne correspond à cette vue",
    emptySearchBody: "Essayez une recherche plus large ou changez le filtre pour réafficher la grille de jeux.",
    emptySearchTitle: "Aucun jeu ne correspond à cette recherche",
    favoritesLabel: "Favoris",
    favoritesOnlyLabel: "Favoris uniquement",
    filterLabel: "Filtrer",
    firstRunLabel: "Première partie",
    helpIntro: "Ouvrez l'aide si vous avez besoin d'un rappel sur le choix du jeu, les points, les classements ou l'état des parties.",
    helpTitle: "Aide Arcade",
    nameSortLabel: "Nom",
    noRecordYetLabel: "Pas encore de record",
    openRankingsLabel: "Ouvrir les classements",
    rankSortLabel: "Meilleur rang",
    recentSortLabel: "Joué récemment",
    recommendedSortLabel: "Recommandé",
    resetFiltersLabel: "Réinitialiser les filtres",
    savedBadgeLabel: "En favori",
    searchLabel: "Recherche",
    searchPlaceholder: "Trouver un jeu ou un style",
    sectionLabel: "Hub de jeu",
    showMoreGamesLabel: "Afficher plus de jeux",
    sortLabel: "Trier",
    title: "Choisissez votre prochain jeu",
  },
};

const tagLabelsByLocale: Record<SupportedArcadeLocale, Record<string, string>> = {
  en: {
    audio: "Audio",
    "fast-start": "Fast start",
    learning: "Learning",
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
  },
  ja: {
    audio: "音声",
    "fast-start": "すぐ始める",
    learning: "学習",
    logic: "ロジック",
    memory: "記憶",
    perception: "認識",
    played: "プレイ済み",
    ranked: "ランク入り",
    reflex: "反射",
    rhythm: "リズム",
    spatial: "空間",
    timing: "タイミング",
    unplayed: "未プレイ",
  },
  zh: {
    audio: "音频",
    "fast-start": "快速上手",
    learning: "学习",
    logic: "逻辑",
    memory: "记忆",
    perception: "观察",
    played: "已游玩",
    ranked: "已上榜",
    reflex: "反应",
    rhythm: "节奏",
    spatial: "空间",
    timing: "时机",
    unplayed: "未游玩",
  },
  fr: {
    audio: "Audio",
    "fast-start": "Démarrage rapide",
    learning: "Apprentissage",
    logic: "Logique",
    memory: "Mémoire",
    perception: "Perception",
    played: "Déjà joué",
    ranked: "Classé",
    reflex: "Réflexe",
    rhythm: "Rythme",
    spatial: "Spatial",
    timing: "Timing",
    unplayed: "Jamais joué",
  },
};

export function getHomeHubCopy(locale: SupportedArcadeLocale) {
  return copyByLocale[locale];
}

export function getLocalizedHomeTagLabel(locale: SupportedArcadeLocale, tag: string) {
  const localizedLabel = tagLabelsByLocale[locale][tag];

  if (localizedLabel) {
    return localizedLabel;
  }

  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatHomeMatchCount(locale: SupportedArcadeLocale, count: number) {
  if (locale === "ja") {
    return `${count}件のゲーム`;
  }

  if (locale === "zh") {
    return `${count} 个游戏`;
  }

  if (locale === "fr") {
    return `${count} jeux`;
  }

  return `${count} games`;
}

export function formatHomeVisibleFavoriteCount(locale: SupportedArcadeLocale, count: number) {
  if (locale === "ja") {
    return `${count}件のお気に入り`;
  }

  if (locale === "zh") {
    return `${count} 个可见收藏`;
  }

  if (locale === "fr") {
    return `${count} favoris visibles`;
  }

  return `${count} visible favorites`;
}

export function formatHomeRunLabel(locale: SupportedArcadeLocale, count: number) {
  if (count <= 0) {
    return getHomeHubCopy(locale).firstRunLabel;
  }

  if (locale === "ja") {
    return `${count}回プレイ`;
  }

  if (locale === "zh") {
    return `已玩 ${count} 次`;
  }

  if (locale === "fr") {
    return `${count} parties`;
  }

  return `${count} runs`;
}

export function formatHomeStartWithLabel(locale: SupportedArcadeLocale, gameName: string) {
  if (locale === "ja") {
    return `${gameName} から始める`;
  }

  if (locale === "zh") {
    return `从 ${gameName} 开始`;
  }

  if (locale === "fr") {
    return `Commencer par ${gameName}`;
  }

  return `Start with ${gameName}`;
}