"use client";

import { useEffect, useState }
  from "react";

import {
  getEvidenceCacheInfo,
} from "../services/evidence-cache-service";

type CacheInfo = {
  cached: boolean;

  uploadedByThisDevice: boolean;

  downloadedAt: string | null;
};

export function useEvidenceCacheInfo(
  evidenceId: string,
) {
  const [info, setInfo] =
    useState<CacheInfo>({
      cached: false,

      uploadedByThisDevice: false,

      downloadedAt: null,
    });

  useEffect(() => {
    getEvidenceCacheInfo(
      evidenceId,
    ).then(setInfo);
  }, [evidenceId]);

  return info;
}