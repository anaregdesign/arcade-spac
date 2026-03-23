import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router";

import { useSoundMute } from "../sound/use-sound-mute";

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
    navPanelId,
    toggleMute,
  };
}
