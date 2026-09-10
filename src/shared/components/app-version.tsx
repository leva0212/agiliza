"use client";

import Tooltip from "@mui/material/Tooltip";

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
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Costa_Rica",
        },
      ).format(
        new Date(buildDate),
      )
      : "No disponible";

  const versionLabel = (
    <span
      className="
        text-xs
        text-gray-500
        opacity-80
      "
    >
      version:
      {shortVersion}
    </span>
  );

  if (showUpdateTooltip) {
    return (
      <Tooltip title={`Fecha última actualización: ${formattedBuildDate}`}>
        {versionLabel}
      </Tooltip>
    );
  }

  return versionLabel;

}
