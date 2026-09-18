"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

const TIME_ZONE = "America/Costa_Rica";

export function RealtimeClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("es-CR", {
        timeZone: TIME_ZONE,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(now)
    : "--:--:--";

  const date = now
    ? new Intl.DateTimeFormat("es-CR", {
        timeZone: TIME_ZONE,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    : "Cargando fecha...";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-white/85 p-4 shadow-sm dark:border-sky-900/70 dark:bg-slate-900/80">
        <div className="flex size-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <Clock3 size={22} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hora de Costa Rica
          </div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {time}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-blue-200/80 bg-white/85 p-4 shadow-sm dark:border-blue-900/70 dark:bg-slate-900/80">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <CalendarDays size={22} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Fecha actual
          </div>
          <div className="capitalize text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">
            {date}
          </div>
        </div>
      </div>
    </div>
  );
}