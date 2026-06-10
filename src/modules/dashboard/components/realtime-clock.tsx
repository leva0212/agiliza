"use client";

import { useEffect, useState } from "react";

export function RealtimeClock() {

  const [
    now,
    setNow,
  ] = useState<Date | null>(
    null,
  );

  useEffect(() => {

    setNow(
      new Date(),
    );

    const interval =
      setInterval(() => {

        setNow(
          new Date(),
        );

      }, 1000);

    return () =>
      clearInterval(
        interval,
      );

  }, []);

  if (!now) {

    return (

      <div className="text-left">

        <div className="
          text-2xl
          font-bold
        ">
          --:--
        </div>

      </div>

    );

  }

  return (

  <div className="text-left grid py-20">

    <div
      className="
        text-[18px]
        font-bold
      "
    >

      {now.toLocaleTimeString(
        "es-CR",
        {
          hour: "numeric",
          minute: "2-digit",
        },
      )}

    </div>

    <div
      className="
        text-[18px] 
      "
    >

      {now.toLocaleDateString(
        "es-CR",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )}

    </div>

  </div>

);

}