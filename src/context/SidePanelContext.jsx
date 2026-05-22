import { createContext, useContext, useState, useCallback, useMemo } from 'react';

/** @type {import('react').Context<{
 *   isOpen: boolean;
 *   openPanel: () => void;
 *   closePanel: () => void;
 *   togglePanel: () => void;
 * } | null>} */
const SidePanelContext = createContext(null);

export function SidePanelProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, openPanel, closePanel, togglePanel }),
    [isOpen, openPanel, closePanel, togglePanel]
  );

  return (
    <SidePanelContext.Provider value={value}>{children}</SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const context = useContext(SidePanelContext);
  if (!context) {
    throw new Error('useSidePanel must be used within SidePanelProvider');
  }
  return context;
}
