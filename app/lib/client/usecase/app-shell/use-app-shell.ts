import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router";

import { useSoundMute } from "../sound/use-sound-mute";

export type AppShellNavItem = {
  key: "rankings" | "profile";
  label: string;
  to: string;
};

const navItems: AppShellNavItem[] = [
  { key: "rankings", label: "Rankings", to: "/rankings" },
  { key: "profile", label: "Profile", to: "/profile" },
];

export function useAppShell(input: { defaultHelpOpen?: boolean }) {
  const [isHelpOpen, setHelpOpen] = useState(Boolean(input.defaultHelpOpen));
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { muted, toggleMute } = useSoundMute();
  const location = useLocation();
  const navPanelId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return {
    closeHelp() {
      setHelpOpen(false);
    },
    handleHelpClick() {
      setHelpOpen(true);
      setMenuOpen(false);
    },
    handleMenuToggle() {
      setMenuOpen((currentValue) => !currentValue);
    },
    handleNavClick() {
      setMenuOpen(false);
    },
    isHelpOpen,
    isMenuOpen,
    muted,
    navItems,
    navPanelId,
    toggleMute,
  };
}
