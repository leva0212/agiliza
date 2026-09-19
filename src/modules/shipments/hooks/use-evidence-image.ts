"use client";

import { useEffect, useState } from "react";
import { getEvidenceImageUrl } from "../services/evidence-cache-service";

export function useEvidenceImage(
  evidenceId: string,
  shipmentId: string,
  fileUrl: string | null,
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      if (!fileUrl) {
        setImageUrl(null);
        return;
      }

      const url = await getEvidenceImageUrl(evidenceId, shipmentId, fileUrl);

      if (cancelled) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }

      objectUrl = url;
      setImageUrl(url);
    }

    void load();

    return () => {
      cancelled = true;
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [evidenceId, shipmentId, fileUrl]);

  return imageUrl;
}