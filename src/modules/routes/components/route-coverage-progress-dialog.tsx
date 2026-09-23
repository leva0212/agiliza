"use client";

import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";

type Stage = "checking" | "updating" | "verifying";

type Props = { open: boolean; stage: Stage; configuredNeighborhoods: number };

const details: Record<Stage, { progress: number; label: string }> = {
  checking: { progress: 25, label: "Comprobando la configuración actual…" },
  updating: { progress: 65, label: "Actualizando la visibilidad de la cobertura…" },
  verifying: { progress: 90, label: "Verificando el cambio en la cobertura…" },
};

export function RouteCoverageProgressDialog({ open, stage, configuredNeighborhoods }: Props) {
  if (!open) return null;
  const current = details[stage];

  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section aria-labelledby="route-coverage-progress-title" aria-modal="true" role="dialog" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center">
            <CircularProgress variant="determinate" value={current.progress} size={56} thickness={4} color="error" />
            <span className="absolute text-xs font-bold text-slate-700">{current.progress}%</span>
          </div>
          <div>
            <h2 id="route-coverage-progress-title" className="text-lg font-bold text-slate-900">Actualizando cobertura</h2>
            <p className="text-sm text-slate-600">Trabajando en ello…</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-slate-700">{current.label}</p>
          <LinearProgress variant="determinate" value={current.progress} color="error" />
          <p className="mt-3 text-xs text-slate-500">
            Se conservarán los {configuredNeighborhoods} barrios configurados para poder reactivar la ruta después.
          </p>
        </div>
      </section>
    </div>
  );
}
