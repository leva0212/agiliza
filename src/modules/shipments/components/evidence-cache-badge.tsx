"use client";

import {
  useEvidenceCacheInfo,
} from "../hooks/use-evidence-cache-info";

type Props = {
  evidenceId: string;
};

export function EvidenceCacheBadge({
  evidenceId,
}: Props) {
  const info =
    useEvidenceCacheInfo(
      evidenceId,
    );

  if (
    info.uploadedByThisDevice
  ) {
    return (
      <span
        className="
          text-xs
          px-2
          py-1
          rounded-full
          bg-green-100
          text-green-700
        "
      >
        📱 Local
      </span>
    );
  }

  if (info.cached) {
    return (
      <span
        className="
          text-xs
          px-2
          py-1
          rounded-full
          bg-blue-100
          text-blue-700
        "
      >
        ☁ Descargada
      </span>
    );
  }

  return (
    <span
      className="
        text-xs
        px-2
        py-1
        rounded-full
        bg-gray-100
        text-gray-600
      "
    >
      ⬇ No descargada
    </span>
  );
}