import { useId, useState } from "react";

export function useGameInstructionsDialog() {
  const [isOpen, setOpen] = useState(false);
  const titleId = useId();

  return {
    close() {
      setOpen(false);
    },
    isOpen,
    open() {
      setOpen(true);
    },
    titleId,
  };
}
