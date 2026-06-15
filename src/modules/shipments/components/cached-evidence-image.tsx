"use client";

import { useEvidenceImage }
  from "../hooks/use-evidence-image";

type Props = {
  evidenceId: string;

  shipmentId: string;

  fileUrl: string | null;

  className?: string;
};

export function CachedEvidenceImage({
  evidenceId,
  shipmentId,
  fileUrl,
  className,
}: Props) {
  const imageUrl =
    useEvidenceImage(
      evidenceId,
      shipmentId,
      fileUrl,
    );

  if (!imageUrl) {
    return (
      <div
        className="
          animate-pulse
          bg-gray-200
          rounded-lg
        "
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      className={className}
    />
  );
}