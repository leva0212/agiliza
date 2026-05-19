"use client";

export function AppVersion() {

  const version =

    process.env
      .NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA

    ||

    "local";

  const shortVersion =

    version.slice(
      0,
      7,
    );

  const buildDate =

    process.env
      .NEXT_PUBLIC_BUILD_DATE

    ||

    "";

  return (

    <div
      className="
        text-xs
        text-gray-500
        opacity-80
      "
    >

      version:
      {shortVersion}

      {" • "}

      build:

      {

        new Date(
          buildDate,
        ).toLocaleString(
          "es-CR",
        )

      }

    </div>

  );

}