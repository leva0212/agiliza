"use client";

import {
  useEvidenceThumbnail,
} from "../hooks/use-evidence-thumbnail";

type Props = {
  evidenceId: string;

  fileUrl: string | null;

  className?: string;
};

export function CachedEvidenceThumbnail({
  evidenceId,
  fileUrl,
  className,
}: Props) {
  const thumbnailUrl =
    useEvidenceThumbnail(
      evidenceId,
    );

  if (
    thumbnailUrl
  ) {
    return (
      <img
        src={thumbnailUrl}
        alt=""
        className={className}
      />
    );
  }

  return (
    <img
      src={fileUrl ?? ""}
      alt=""
      className={className}
    />
  );
}