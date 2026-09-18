"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

const PageCloseGuardContext = createContext<((dirty: boolean) => void) | null>(
  null,
);

type ProviderProps = {
  children: ReactNode;
  onChange: (dirty: boolean) => void;
};

export function PageCloseGuardProvider({ children, onChange }: ProviderProps) {
  return (
    <PageCloseGuardContext.Provider value={onChange}>
      {children}
    </PageCloseGuardContext.Provider>
  );
}

export function usePageCloseGuard(hasUnsavedChanges: boolean) {
  const setDirty = useContext(PageCloseGuardContext);

  useEffect(() => {
    if (!setDirty) return;

    setDirty(hasUnsavedChanges);
    return () => setDirty(false);
  }, [hasUnsavedChanges, setDirty]);
}
