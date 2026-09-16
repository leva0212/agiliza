"use client";

import { useCallback, useEffect, useRef } from "react";

type Options = {
  open: boolean;
  blocked: boolean;
  historyKey: string;
  onClose: () => void;
  onBlocked: () => void;
};

export function useDialogBrowserBack({
  open,
  blocked,
  historyKey,
  onClose,
  onBlocked,
}: Options) {
  const blockedRef = useRef(blocked);
  const onCloseRef = useRef(onClose);
  const onBlockedRef = useRef(onBlocked);
  const historyEntryActiveRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);
  const marker = `__dialog_${historyKey}`;

  useEffect(() => {
    blockedRef.current = blocked;
    onCloseRef.current = onClose;
    onBlockedRef.current = onBlocked;
  }, [blocked, onBlocked, onClose]);

  useEffect(() => {
    if (!open) return;

    const currentState = window.history.state ?? {};

    if (!currentState[marker]) {
      window.history.pushState(
        { ...currentState, [marker]: true },
        "",
        window.location.href,
      );
    }

    historyEntryActiveRef.current = true;

    const handlePopState = () => {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }

      if (!historyEntryActiveRef.current) return;

      if (blockedRef.current) {
        window.history.pushState(
          { ...(window.history.state ?? {}), [marker]: true },
          "",
          window.location.href,
        );
        onBlockedRef.current();
        return;
      }

      historyEntryActiveRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [marker, open]);

  return useCallback(() => {
    if (blockedRef.current) {
      onBlockedRef.current();
      return;
    }

    if (historyEntryActiveRef.current && window.history.state?.[marker]) {
      ignoreNextPopStateRef.current = true;
      historyEntryActiveRef.current = false;
      window.history.back();
    }

    onCloseRef.current();
  }, [marker]);
}
