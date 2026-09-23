"use client";

import { formatElapsedTime } from "@/shared/utils/format-elapsed-time";

type AppVersionProps = {
  showUpdateTooltip?: boolean;
};

export function AppVersion({ showUpdateTooltip = false }: AppVersionProps) {

  const version =
    process.env
      .NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    || "local";

  const shortVersion =
    version.slice(0, 7);

  const buildDate =
    process.env
      .NEXT_PUBLIC_BUILD_DATE
    || "";

  const formattedBuildDate =
    buildDate
      ? new Intl.DateTimeFormat(
        "es-CR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "America/Costa_Rica",
        },
      ).format(
        new Date(buildDate),
      )
      : "No disponible";

  const relativeBuildDate = buildDate && !Number.isNaN(new Date(buildDate).getTime())
    ? formatElapsedTime(buildDate)
    : "no disponible";

  const versionLabel = (
    <span className="text-xs text-gray-500 opacity-80">
      Versión: {shortVersion}
    </span>
  );

  if (showUpdateTooltip) {
    return (
      <span className="flex max-w-full flex-col items-center gap-0.5 px-2 text-center leading-tight">
        {versionLabel}
        <span className="text-[10px] text-gray-500 opacity-80">
          Fecha versión: {formattedBuildDate}
        </span>
        <span className="text-[10px] text-gray-500 opacity-80">
          Última actualización de software: {relativeBuildDate}
        </span>
      </span>
    );
  }

  return versionLabel;

}
