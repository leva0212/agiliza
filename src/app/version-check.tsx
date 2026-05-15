"use client";

import {
  useEffect,
} from "react";

const APP_VERSION =
  process.env
    .NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  || "local-dev";

export function VersionCheck() {

  useEffect(
    () => {

      const savedVersion =

        localStorage.getItem(

          "app_version"

        );

      if (

        savedVersion

        &&

        savedVersion !==
          APP_VERSION

      ) {

        localStorage.setItem(

          "app_version",

          APP_VERSION

        );

        window.location.reload();

        return;

      }

      localStorage.setItem(

        "app_version",

        APP_VERSION

      );

    },
    []
  );

  return null;

}