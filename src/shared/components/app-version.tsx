export function AppVersion() {

  const version =

    process.env
      .NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA

    ||

    "local";

  const deployDate =

    process.env
      .NEXT_PUBLIC_VERCEL_DEPLOYMENT_CREATED_AT

    ||

    null;

  const shortVersion =

    version.slice(
      0,
      7
    );

  const formattedDate =

    deployDate

      ? new Date(
          deployDate
        ).toLocaleString(
          "es-CR"
        )

      : "local";

  return (

    <div
      className="
        text-xs
        text-gray-500
        opacity-80
      "
    >

      v{
        shortVersion
      }

      {" • "}

      {
        formattedDate
      }

    </div>

  );

}