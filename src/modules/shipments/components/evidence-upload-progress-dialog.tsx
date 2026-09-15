"use client";

import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";

type Props = {
  open: boolean;
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  currentProgress: number;
  totalProgress: number;
  stage: "preparing" | "uploading" | "saving";
  onCancel: () => void;
};

const stageLabel = {
  preparing: "Preparando archivo...",
  uploading: "Subiendo archivo...",
  saving: "Guardando archivo...",
} as const;

export function EvidenceUploadProgressDialog({
  open,
  currentFileName,
  currentFileIndex,
  totalFiles,
  currentProgress,
  totalProgress,
  stage,
  onCancel,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="evidence-upload-progress-title"
        aria-modal="true"
        role="dialog"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center">
            <CircularProgress variant="determinate" value={totalProgress} size={56} thickness={4} />
            <span className="absolute text-xs font-bold text-slate-700">{totalProgress}%</span>
          </div>
          <div className="min-w-0">
            <h2 id="evidence-upload-progress-title" className="text-lg font-bold text-slate-900">
              Subiendo archivos
            </h2>
            <p className="text-sm text-slate-600">
              Archivo {currentFileIndex} de {totalFiles}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1 flex w-[62.5%] items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-700">{stageLabel[stage]}</span>
              <span className="shrink-0 font-semibold text-slate-700">{currentProgress}%</span>
            </div>
            <p className="mb-2 truncate text-xs text-slate-500">{currentFileName}</p>
            <div className="w-[62.5%]">
              <LinearProgress variant="determinate" value={currentProgress} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Progreso total</span>
              <span className="font-semibold text-slate-700">{totalProgress}%</span>
            </div>
            <LinearProgress variant="determinate" value={totalProgress} color="success" />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
