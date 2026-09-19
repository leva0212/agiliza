"use client";

import { useEffect, useState } from "react";
import { getEvidenceThumbnailUrl } from "../services/evidence-cache-service";

export function useEvidenceThumbnail(evidenceId: string) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      const url = await getEvidenceThumbnailUrl(evidenceId);

      if (cancelled) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }

      if (!url) return;
      objectUrl = url;
      setThumbnailUrl(url);
    }

    void load();

    return () => {
      cancelled = true;
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [evidenceId]);

  return thumbnailUrl;
}