"use client";

import { useEvidenceThumbnail } from "../hooks/use-evidence-thumbnail";

type Props = {
  evidenceId: string;
  fileUrl: string | null;
  thumbnailUrl?: string | null;
  className?: string;
};

export function CachedEvidenceThumbnail({
  evidenceId,
  fileUrl,
  thumbnailUrl,
  className,
}: Props) {
  const localThumbnailUrl = useEvidenceThumbnail(evidenceId);
  const src = localThumbnailUrl ?? thumbnailUrl ?? fileUrl ?? "";

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}