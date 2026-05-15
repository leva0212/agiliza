export function AppVersion() {

  const version =

    process.env
      .NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA

    ||

    "local";

  const shortVersion =

    version.slice(
      0,
      7
    );

  // fecha del build actual
  const buildDate =

    new Date()
      .toLocaleString(
        "es-CR"
      );

  return (

    <div
      className="
        text-xs
        text-gray-500
        opacity-80
      "
    >

      version: {
        shortVersion
      }

      {" • "}

      {
        buildDate
      }

    </div>

  );

}