"use client";

import {
  useEffect,
  useState,
} from "react";

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

  const [

    buildDate,

    setBuildDate,

  ] = useState(
    "",
  );

  useEffect(
    () => {

      setBuildDate(

        new Date()

          .toLocaleString(

            "es-CR",

          ),

      );

    },

    [],
  );

  return (

    <div
      className="
        text-xs
        text-gray-500
        opacity-80
      "
    >

      version:

      {

        shortVersion

      }

      {" • "}

      {

        buildDate

      }

    </div>

  );

}