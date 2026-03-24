import type { SupportedArcadeLocale } from "../../../domain/entities/locale";

type LocaleUiCopy = {
  browserDefaultLabel: string;
  closeLabel: string;
  helpEyebrow: string;
  howToPlayLabel: string;
  languageLabel: string;
  menuAriaLabel: string;
  menuCloseLabel: string;
  menuOpenLabel: string;
  muteLabel: string;
  navHomeLabel: string;
  navProfileLabel: string;
  navRankingsLabel: string;
  shareCopyFailedLabel: string;
  shareCopiedLabel: string;
  shareLabel: string;
  signOutLabel: string;
  unmuteLabel: string;
};

const localeUiCopyByLocale: Record<SupportedArcadeLocale, LocaleUiCopy> = {
  en: {
    browserDefaultLabel: "Use browser language",
    closeLabel: "Close",
    helpEyebrow: "How to play",
    howToPlayLabel: "How to play",
    languageLabel: "Language",
    menuAriaLabel: "Primary",
    menuCloseLabel: "Close menu",
    menuOpenLabel: "Open menu",
    muteLabel: "Mute sounds",
    navHomeLabel: "Home",
    navProfileLabel: "Profile",
    navRankingsLabel: "Rankings",
    shareCopyFailedLabel: "Clipboard copy failed. Try again.",
    shareCopiedLabel: "Share text copied.",
    shareLabel: "Share",
    signOutLabel: "Sign out",
    unmuteLabel: "Unmute sounds",
  },
  ja: {
    browserDefaultLabel: "ブラウザに合わせる",
    closeLabel: "閉じる",
    helpEyebrow: "遊び方",
    howToPlayLabel: "遊び方",
    languageLabel: "表示言語",
    menuAriaLabel: "主要メニュー",
    menuCloseLabel: "メニューを閉じる",
    menuOpenLabel: "メニューを開く",
    muteLabel: "サウンドをミュート",
    navHomeLabel: "ホーム",
    navProfileLabel: "プロフィール",
    navRankingsLabel: "ランキング",
    shareCopyFailedLabel: "クリップボードへのコピーに失敗しました。もう一度お試しください。",
    shareCopiedLabel: "共有テキストをコピーしました。",
    shareLabel: "共有",
    signOutLabel: "サインアウト",
    unmuteLabel: "サウンドをオン",
  },
  zh: {
    browserDefaultLabel: "跟随浏览器",
    closeLabel: "关闭",
    helpEyebrow: "玩法说明",
    howToPlayLabel: "玩法说明",
    languageLabel: "显示语言",
    menuAriaLabel: "主导航",
    menuCloseLabel: "关闭菜单",
    menuOpenLabel: "打开菜单",
    muteLabel: "静音",
    navHomeLabel: "主页",
    navProfileLabel: "个人资料",
    navRankingsLabel: "排行榜",
    shareCopyFailedLabel: "复制到剪贴板失败，请重试。",
    shareCopiedLabel: "分享文本已复制。",
    shareLabel: "分享",
    signOutLabel: "退出登录",
    unmuteLabel: "取消静音",
  },
  fr: {
    browserDefaultLabel: "Suivre le navigateur",
    closeLabel: "Fermer",
    helpEyebrow: "Comment jouer",
    howToPlayLabel: "Comment jouer",
    languageLabel: "Langue",
    menuAriaLabel: "Navigation principale",
    menuCloseLabel: "Fermer le menu",
    menuOpenLabel: "Ouvrir le menu",
    muteLabel: "Couper le son",
    navHomeLabel: "Accueil",
    navProfileLabel: "Profil",
    navRankingsLabel: "Classements",
    shareCopyFailedLabel: "La copie dans le presse-papiers a echoue. Reessayez.",
    shareCopiedLabel: "Le texte de partage a ete copie.",
    shareLabel: "Partager",
    signOutLabel: "Se déconnecter",
    unmuteLabel: "Réactiver le son",
  },
};

export function getLocaleUiCopy(locale: SupportedArcadeLocale) {
  return localeUiCopyByLocale[locale];
}