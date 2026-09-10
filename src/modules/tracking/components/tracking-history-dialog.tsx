"use client";

import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { getTrackingRecordHistory } from "../api/get-tracking-record-history";
import type { TrackingRecord } from "../types/tracking-record";

type Props = {
  open: boolean;
  record: TrackingRecord | null;
  onClose: () => void;
};

function displayValue(value: string | null) {
  return value?.trim() || "sin valor";
}

function formatElapsedTime(value: string) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1_000),
  );

  if (elapsedSeconds < 60) return "hace unos segundos";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `hace ${elapsedMinutes} ${elapsedMinutes === 1 ? "minuto" : "minutos"}`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `hace ${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 30) return `hace ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`;

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return `hace ${elapsedMonths} ${elapsedMonths === 1 ? "mes" : "meses"}`;

  const elapsedYears = Math.floor(elapsedMonths / 12);
  return `hace ${elapsedYears} ${elapsedYears === 1 ? "año" : "años"}`;
}

export function TrackingHistoryDialog({
  open,
  record,
  onClose,
}: Props) {
  const historyQuery = useQuery({
    queryKey: ["tracking-record-history", record?.id],
    queryFn: () => getTrackingRecordHistory(record!.id),
    enabled: open && Boolean(record),
  });

  if (!open || !record) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={onClose}
    >
      <section
        aria-labelledby="tracking-history-title"
        className="flex max-h-[90dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 id="tracking-history-title" className="text-xl font-bold text-slate-900">
              Historial de cambios
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {record.full_name} · {record.identification}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="min-h-24 flex-1 overflow-y-auto p-4 sm:p-6">
          {historyQuery.isLoading && <p className="text-sm text-slate-500">Cargando historial...</p>}

          {historyQuery.isError && (
            <p className="text-sm text-red-600">No fue posible cargar el historial.</p>
          )}

          {!historyQuery.isLoading && !historyQuery.isError && historyQuery.data?.length === 0 && (
            <p className="text-sm text-slate-500">Este registro todavía no tiene cambios.</p>
          )}

          <ol className="space-y-3">
            {historyQuery.data?.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">
                    {entry.changed_by_profile?.full_name ?? "Usuario eliminado"}
                  </span>
                  {" modificó "}
                  <span className="font-semibold">{entry.field_name}</span>
                  {" de “"}{displayValue(entry.previous_value)}{"” a “"}
                  {displayValue(entry.new_value)}{"”."}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(entry.changed_at).toLocaleString("es-CR")}
                </p>
                <p className="text-xs text-slate-400">
                  {formatElapsedTime(entry.changed_at)}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex shrink-0 justify-end border-t px-4 py-3 sm:px-6 sm:py-4">
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">
            Cerrar
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
