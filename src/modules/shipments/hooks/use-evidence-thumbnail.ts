"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getEvidenceThumbnailUrl,
} from "../services/evidence-cache-service";

export function useEvidenceThumbnail(
  evidenceId: string,
) {
  const [
    thumbnailUrl,
    setThumbnailUrl,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    let objectUrl:
      | string
      | null = null;

    async function load() {
      const url =
        await getEvidenceThumbnailUrl(
          evidenceId,
        );

      if (
        !mounted ||
        !url
      ) {
        return;
      }

      objectUrl = url;

      setThumbnailUrl(url);
    }

    load();

    return () => {
      mounted = false;

      if (
        objectUrl?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          objectUrl,
        );
      }
    };
  }, [evidenceId]);

  return thumbnailUrl;
}