"use client";

import { useEffect, useState, useRef } from "react";
//import { ImageViewer } from "./image-viewer";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Crop,
  RefreshCcw,
  Copy,
  ScanLine,
  ScanBarcode,
} from "lucide-react";

import type { PendingEvidence } from "../../types/pending-evidence";
import { EvidenceCropDialogCanvas } from "./crop-dialog/evidence-crop-dialog-canvas";
import { processImage } from "@/shared/utils/process-image";
import { generateThumbnail } from "../../utils/generate-thumbnail";
import {
  type EvidenceImageAnalysis,
  type EvidenceAnalysisProgress,
} from "../../utils/analyze-evidence-image";
import { scanSimpleBarcodeBatch, type BarcodeMetrics } from "../../utils/simple-barcode-batch";
import { toast } from "sonner";
import { BarcodeLiveScannerDialog } from "../barcode-live-scanner-dialog";
type AnalysisDebugInfo = {
  barcodeMs: number | null;
  totalMs: number;
};

type Props = {
  open: boolean;

  evidences: PendingEvidence[];

  onClose: () => void;

  onUpload: (evidences: PendingEvidence[]) => Promise<void>;

  isUploading?: boolean;
  shipmentItems?: Array<{ id: string; productName: string }>;
  shipmentCompanyCode?: string | null;
};

export function ShipmentEvidenceEditor({
  open,
  evidences,
  onClose,
  onUpload,
  isUploading = false,
  shipmentItems = [],
  shipmentCompanyCode,
}: Props) {
  const [cropOpen, setCropOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<PendingEvidence[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState("");
  const [activePreviewLoading, setActivePreviewLoading] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [thumbnailGenerationPaused, setThumbnailGenerationPaused] =
    useState(false);
  const [analysisByEvidenceId, setAnalysisByEvidenceId] = useState<
    Record<string, EvidenceImageAnalysis | "loading">
  >({});
  const [liveScannerOpen, setLiveScannerOpen] = useState(false);
  const [batchHd, setBatchHd] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchMessage, setBatchMessage] = useState("Selecciona Normal o HD e inicia la lectura");
  const [batchTotalMs, setBatchTotalMs] = useState<number | null>(null);
  const [barcodeMetrics, setBarcodeMetrics] = useState<Record<string, BarcodeMetrics>>({});
  const batchControllerRef = useRef<AbortController | null>(null);
  const [analysisDebugByEvidenceId, setAnalysisDebugByEvidenceId] = useState<
    Record<string, AnalysisDebugInfo>
  >({});
  const [analysisProgressByEvidenceId, setAnalysisProgressByEvidenceId] =
    useState<Record<string, EvidenceAnalysisProgress>>({});

  const touchStartX = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activePreviewUrlRef = useRef("");
  const cropImageUrlRef = useRef("");
  const thumbnailUrlsRef = useRef(new Set<string>());
  const thumbnailEvidenceIdsRef = useRef(new Set<string>());
  const imageWorkQueueRef = useRef<Promise<void>>(Promise.resolve());
  const analyzedEvidenceIdsRef = useRef(new Set<string>());
  const cleanupTimerRef = useRef<number | null>(null);

  const current = items[index];
  const currentId = current?.id;
  const currentOriginalFile = current?.originalFile;
  const currentHd = current?.hd;
  const currentRotation = current?.rotation;
  const currentFlipX = current?.flipX;
  const currentFlipY = current?.flipY;
  const currentCropX = current?.cropX;
  const currentCropY = current?.cropY;
  const currentCropWidth = current?.cropWidth;
  const currentCropHeight = current?.cropHeight;
  useEffect(() => {
    if (!open || !currentOriginalFile) {
      return;
    }

    let cancelled = false;

    async function loadActivePreview() {
      await Promise.resolve();

      if (activePreviewUrlRef.current) {
        URL.revokeObjectURL(activePreviewUrlRef.current);
        activePreviewUrlRef.current = "";
      }

      setActivePreviewUrl("");
      setActivePreviewLoading(true);

      try {
        const previewTask = imageWorkQueueRef.current.then(() => {
          if (cancelled) return null;

          return processImage(currentOriginalFile, {
            hd: currentHd ?? false,
            rotation: currentRotation ?? 0,
            flipX: currentFlipX ?? false,
            flipY: currentFlipY ?? false,
            cropX: currentCropX,
            cropY: currentCropY,
            cropWidth: currentCropWidth || 1,
            cropHeight: currentCropHeight || 1,
          });
        });

        imageWorkQueueRef.current = previewTask.then(
          () => undefined,
          () => undefined,
        );

        const processedFile = await previewTask;

        if (!processedFile) return;

        const nextUrl = URL.createObjectURL(processedFile);

        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }

        activePreviewUrlRef.current = nextUrl;
        setActivePreviewUrl(nextUrl);
      } catch (error) {
        console.error("[Evidence lazy preview]", error);
      } finally {
        if (!cancelled) {
          setActivePreviewLoading(false);
        }
      }
    }

    void loadActivePreview();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    currentId,
    currentOriginalFile,
    currentHd,
    currentRotation,
    currentFlipX,
    currentFlipY,
    currentCropX,
    currentCropY,
    currentCropWidth,
    currentCropHeight,
  ]);

  useEffect(() => {
    if (!open || evidences.length === 0 || thumbnailGenerationPaused) {
      return;
    }

    let cancelled = false;

    async function generateSmallThumbnails() {
      for (const evidence of evidences) {
        if (cancelled || thumbnailGenerationPaused) break;

        try {
          if (thumbnailEvidenceIdsRef.current.has(evidence.id)) continue;

          const thumbnailTask = imageWorkQueueRef.current.then(() => {
            if (cancelled) return null;
            return generateThumbnail(evidence.originalFile, 160);
          });

          imageWorkQueueRef.current = thumbnailTask.then(
            () => undefined,
            () => undefined,
          );

          const thumbnail = await thumbnailTask;

          if (!thumbnail) break;

          const thumbnailUrl = URL.createObjectURL(thumbnail);

          if (cancelled) {
            URL.revokeObjectURL(thumbnailUrl);
            break;
          }

          thumbnailUrlsRef.current.add(thumbnailUrl);
          thumbnailEvidenceIdsRef.current.add(evidence.id);
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === evidence.id && !item.thumbnailUrl
                ? { ...item, thumbnailUrl }
                : item,
            ),
          );

          await new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => resolve());
          });
        } catch (error) {
          console.error("[Evidence thumbnail]", error);
        }
      }
    }

    void generateSmallThumbnails();

    return () => {
      cancelled = true;
    };
  }, [evidences, open, thumbnailGenerationPaused]);

  useEffect(() => {
    if (!open) return;

    // React Strict Mode ejecuta limpieza y montaje una vez adicional en desarrollo.
    // Se difiere la liberación para que el nuevo montaje pueda cancelarla.
    if (cleanupTimerRef.current !== null) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    const thumbnailUrls = thumbnailUrlsRef.current;
    const thumbnailEvidenceIds = thumbnailEvidenceIdsRef.current;

    return () => {
      cleanupTimerRef.current = window.setTimeout(() => {
        if (activePreviewUrlRef.current) {
          URL.revokeObjectURL(activePreviewUrlRef.current);
          activePreviewUrlRef.current = "";
        }

        if (cropImageUrlRef.current) {
          URL.revokeObjectURL(cropImageUrlRef.current);
          cropImageUrlRef.current = "";
        }

        for (const thumbnailUrl of thumbnailUrls) {
          URL.revokeObjectURL(thumbnailUrl);
        }

        thumbnailUrls.clear();
        thumbnailEvidenceIds.clear();
        cleanupTimerRef.current = null;
      }, 250);
    };
  }, [open]);
  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";

    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [index, current?.notes]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  function autoGrowTextarea(element: HTMLTextAreaElement) {
    element.style.height = "0px";

    const maxHeight = 24 * 5;

    element.style.height = Math.min(element.scrollHeight, maxHeight) + "px";
  }

  function closeCropDialog() {
    setCropOpen(false);
    setThumbnailGenerationPaused(false);

    if (cropImageUrlRef.current) {
      URL.revokeObjectURL(cropImageUrlRef.current);
      cropImageUrlRef.current = "";
    }

    setCropImageUrl("");
  }

  async function openCropDialog() {
    if (!current) return;

    setThumbnailGenerationPaused(true);
    await imageWorkQueueRef.current;

    if (cropImageUrlRef.current) {
      URL.revokeObjectURL(cropImageUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(current.originalFile);
    cropImageUrlRef.current = nextUrl;
    setCropImageUrl(nextUrl);
    setCropOpen(true);
  }
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function initializeEditor() {
      await Promise.resolve();

      if (!cancelled) {
        setItems(
          evidences.map((evidence) => ({
            ...evidence,
            shipmentItemId:
              evidence.shipmentItemId ??
              (shipmentItems.length === 1 ? shipmentItems[0].id : null),
          })),
        );
        setIndex(0);
      }
    }

    void initializeEditor();

    return () => {
      cancelled = true;
    };
  }, [open, evidences, shipmentItems]);

  // Edits and thumbnail updates must not discard in-flight analysis results.
  useEffect(() => {
    return () => { batchControllerRef.current?.abort(); };
  }, [open, evidences]);

  async function analyzeNewImages() {
    if (batchControllerRef.current) return;
    const pending = items.filter(item => !analyzedEvidenceIdsRef.current.has(item.id));
    if (!pending.length) return;
    const controller = new AbortController();
    batchControllerRef.current = controller;
    setBatchBusy(true);
    setBatchTotalMs(null);
    setAnalysisByEvidenceId(previous => ({
      ...previous,
      ...Object.fromEntries(pending.map(item => [item.id, "loading" as const])),
    }));
    try {
      const result = await scanSimpleBarcodeBatch(
        pending.map(item => ({ id: item.id, file: item.originalFile, hd: batchHd })),
        {
          signal: controller.signal,
          onProgress: progress => {
            if (!controller.signal.aborted) setBatchMessage(
              (progress.phase === "optimizing" ? "Optimizando" : "Leyendo códigos") +
              " " + progress.completed + "/" + progress.total,
            );
          },
          onResult: metrics => {
            if (controller.signal.aborted) return;
            analyzedEvidenceIdsRef.current.add(metrics.id);
            setBarcodeMetrics(previous => ({ ...previous, [metrics.id]: metrics }));
            const analysis: EvidenceImageAnalysis = {
              barcode: metrics.barcode, text: "", internalCompanyCode: null,
              barcodeMs: metrics.scanMs, ocrMs: 0,
              totalMs: metrics.optimizationMs + metrics.scanMs,
            };
            setAnalysisByEvidenceId(previous => ({ ...previous, [metrics.id]: analysis }));
            setAnalysisDebugByEvidenceId(previous => ({ ...previous, [metrics.id]: {
              barcodeMs: metrics.scanMs, totalMs: analysis.totalMs,
            } }));
            setAnalysisProgressByEvidenceId(previous => ({ ...previous, [metrics.id]: {
              stage: "finished", message: metrics.error ?? "Lectura terminada",
              barcode: metrics.barcode, elapsedMs: analysis.totalMs,
            } }));
            setItems(previous => previous.map(item => item.id === metrics.id
              ? { ...item, detectedBarcode: item.detectedBarcode ?? metrics.barcode }
              : item));
          },
        },
      );
      if (!controller.signal.aborted) {
        setBatchTotalMs(result.totalMs);
        setBatchMessage("Lote terminado: " + result.rows.length + " imágenes");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setBatchMessage("No fue posible completar el lote. Puedes reintentar las imágenes pendientes.");
        console.error("[Barcode batch]", error);
      }
    } finally {
      if (batchControllerRef.current === controller) {
        batchControllerRef.current = null;
        setBatchBusy(false);
      }
    }
  }

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => {
      analyzedEvidenceIdsRef.current.clear();
      setBarcodeMetrics({});
      setBatchTotalMs(null);
      setBatchMessage("Selecciona Normal o HD e inicia la lectura");
      setAnalysisByEvidenceId({});
      setAnalysisDebugByEvidenceId({});
      setAnalysisProgressByEvidenceId({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open || items.length === 0) {
    return null;
  }

  const currentAnalysis = current
    ? analysisByEvidenceId[current.id]
    : undefined;
  const currentAnalysisDebug = current
    ? analysisDebugByEvidenceId[current.id]
    : undefined;
  const currentAnalysisProgress = current
    ? analysisProgressByEvidenceId[current.id]
    : undefined;
  const hasPendingAnalysis = items.some(
    (item) =>
      analysisByEvidenceId[item.id] === "loading" ||
      !analysisByEvidenceId[item.id],
  );
  const detectedBarcode =
    current?.detectedBarcode ??
    (currentAnalysis !== "loading" ? currentAnalysis?.barcode : null) ??
    null;
  const detectedDtsCode =
    current?.detectedCompanyCode ??
    (currentAnalysis !== "loading"
      ? currentAnalysis?.internalCompanyCode
      : null) ??
    null;
  const expectedDetectedCode =
    shipmentCompanyCode?.match(/^DTS(0\d{2})$/i)?.[1] ?? null;
  const companyMismatch = Boolean(
    detectedDtsCode &&
    expectedDetectedCode &&
    detectedDtsCode !== expectedDetectedCode,
  );
  const hasUnjustifiedCompanyMismatch = items.some((item) =>
    Boolean(
      item.detectedCompanyCode &&
      expectedDetectedCode &&
      item.detectedCompanyCode !== expectedDetectedCode &&
      !item.companyMismatchJustification.trim(),
    ),
  );

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        bg-black
        flex
        flex-col
        overscroll-none
      "
    >
      {/* HUD temporal de diagnóstico: siempre visible en móvil */}
      <div className="pointer-events-none absolute left-1/2 top-20 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
        <div className="rounded-xl border-2 border-yellow-300 bg-black/90 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur">
          <div className="mb-1 font-bold text-yellow-300">
            LECTURA DIRECTA — HTML5-QRCODE
          </div>

          <div className="grid gap-1">
            <div>
              Etapa:{" "}
              <span className="font-bold text-cyan-300">
                {currentAnalysisProgress?.stage ?? "esperando"}
              </span>
            </div>

            <div className="font-semibold">
              {currentAnalysisProgress?.message ??
                "Esperando inicio del análisis..."}
            </div>

            <div className="break-all font-mono">
              Barcode:{" "}
              {currentAnalysisProgress?.barcode ??
                detectedBarcode ??
                (currentAnalysis === "loading"
                  ? "pendiente..."
                  : "❌ NO DETECTADO")}
            </div>

            <div>
              Transcurrido etapa:{" "}
              {currentAnalysisProgress
                ? `${(currentAnalysisProgress.elapsedMs / 1000).toFixed(2)} s`
                : "—"}
            </div>

            {currentAnalysis && currentAnalysis !== "loading" && (
              <>
                <div>
                  Barcode: {(currentAnalysis.barcodeMs / 1000).toFixed(2)} s
                </div>
                <div>Sin OCR ni fallbacks</div>
                <div>
                  Total: {(currentAnalysis.totalMs / 1000).toFixed(2)} s
                </div>
              </>
            )}

            <div className="truncate text-[10px] text-white/65">
              {typeof navigator !== "undefined" ? navigator.userAgent : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay superior */}

      <div
        className="
    absolute
    top-4
    left-4
    right-4

    z-20

    flex
    items-center
    justify-between
  "
      >
        <button
          onClick={onClose}
          className="
      w-12
      h-12

      rounded-full

      bg-black/40
      backdrop-blur

      text-white

      flex
      items-center
      justify-center
    "
        >
          <X size={22} />
        </button>

        <div
          className="
      flex
      items-center
      gap-2
    "
        >
          <button
            type="button"
            onClick={() => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],
                hd: !copy[index].hd,
              };

              setItems(copy);
            }}
            className={`
        px-3
        h-10

        rounded-full

        text-sm
        font-medium

        backdrop-blur

        ${current.hd ? "bg-blue-600 text-white" : "bg-black/40 text-white"}
      `}
          >
            HD
          </button>

          <button
            type="button"
            onClick={() => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],
                file: copy[index].originalFile,
                hd: false,
                rotation: 0,
                flipX: false,
                flipY: false,
                cropX: 0,
                cropY: 0,
                cropWidth: 0,
                cropHeight: 0,
              };

              setItems(copy);
            }}
            className="
    w-10
    h-10

    rounded-full

    bg-red-600

    text-white

    flex
    items-center
    justify-center
  "
            title="Reset"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            type="button"
            onClick={openCropDialog}
            className="
    w-10
    h-10

    rounded-full

    bg-black/40
    backdrop-blur

    text-white

    flex
    items-center
    justify-center
  "
          >
            <Crop size={18} />
          </button>
          <button
            type="button"
            onClick={() => setLiveScannerOpen(true)}
            title="Escanear código de barras con la cámara"
            className="flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-3 text-sm font-medium text-white"
          >
            <ScanBarcode size={18} />{" "}
            <span className="hidden sm:inline">Escanear</span>
          </button>
        </div>
      </div>

      {/* Imagen */}

      <div
        className="
    absolute
    inset-0

    bg-black
    overflow-hidden
  "
      >
        <div
          //ref={carouselRef}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) {
              return;
            }

            const delta = e.changedTouches[0].clientX - touchStartX.current;

            if (delta < -60 && index < items.length - 1) {
              setIndex(index + 1);
            }

            if (delta > 60 && index > 0) {
              setIndex(index - 1);
            }

            touchStartX.current = null;
          }}
          onScroll={(e) => {
            const element = e.currentTarget;

            const newIndex = Math.round(
              element.scrollLeft / element.clientWidth,
            );

            if (
              newIndex !== index &&
              newIndex >= 0 &&
              newIndex < items.length
            ) {
              setIndex(newIndex);
            }
          }}
          className="
  h-full
  flex
"
        >
          <div
            className="
    w-full
    h-full

    flex
    items-center
    justify-center
  "
          >
            <div
              className="
      w-full
      h-full

      flex
      items-center
      justify-center
    "
            >
              {activePreviewUrl ? (
                <img
                  key={activePreviewUrl}
                  src={activePreviewUrl}
                  alt="Vista previa de evidencia"
                  className="block max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-sm text-white/75">
                  <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>
                    {activePreviewLoading
                      ? "Preparando imagen..."
                      : "No fue posible mostrar la imagen"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 left-4 right-4 z-20 hidden items-center justify-between md:flex">
          <button
            type="button"
            aria-label="Imagen anterior"
            title="Imagen anterior"
            disabled={index === 0}
            onClick={() => setIndex((currentIndex) => currentIndex - 1)}
            className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={26} />
          </button>

          <button
            type="button"
            aria-label="Imagen siguiente"
            title="Imagen siguiente"
            disabled={index === items.length - 1}
            onClick={() => setIndex((currentIndex) => currentIndex + 1)}
            className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}

      {/* Panel inferior */}

      <div
        className="
    absolute

    left-4
    right-4
    bottom-4

    z-20
  "
      >
        <div className="mb-2 rounded-2xl bg-black/70 p-3 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ScanLine size={17} /> Lectura de la imagen
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <label>Optimización del lote: <select aria-label="Optimización del lote" className="bg-slate-800 p-1" value={batchHd ? "hd" : "normal"} disabled={batchBusy} onChange={event => setBatchHd(event.target.value === "hd")}>
              <option value="normal">Normal</option><option value="hd">HD</option>
            </select></label>
            <button type="button" className="rounded bg-emerald-700 px-3 py-2 disabled:opacity-50" disabled={batchBusy || !hasPendingAnalysis} onClick={() => void analyzeNewImages()}>
              {batchBusy ? "Procesando…" : "Leer imágenes nuevas"}
            </button>
          </div>
          <p role="status" className="mt-1 text-xs">{batchMessage}{batchTotalMs !== null ? " · Total lote: " + (batchTotalMs / 1000).toFixed(2) + " s" : ""}</p>
          {barcodeMetrics[current.id] && <details className="mt-1 text-xs">
            <summary>Métricas de {barcodeMetrics[current.id].name}</summary>
            <p>Original: {barcodeMetrics[current.id].originalWidth} × {barcodeMetrics[current.id].originalHeight} · {barcodeMetrics[current.id].originalBytes} bytes</p>
            <p>JPEG ({barcodeMetrics[current.id].hd ? "HD" : "Normal"}): {barcodeMetrics[current.id].optimizedWidth} × {barcodeMetrics[current.id].optimizedHeight} · {barcodeMetrics[current.id].optimizedBytes} bytes</p>
            <p>Optimización: {barcodeMetrics[current.id].optimizationMs.toFixed(0)} ms · scanFile: {barcodeMetrics[current.id].scanMs.toFixed(0)} ms</p>
          </details>}
          {currentAnalysis === "loading" ? (
            <p className="mt-1 text-xs text-white/75">
              {batchMessage}
            </p>
          ) : currentAnalysis ? (
            <div className="mt-2 grid gap-1.5 text-xs">
              <AnalysisValue label="Código de barras" value={detectedBarcode} />
              <AnalysisValue
                label="Código DTS detectado"
                value={detectedDtsCode}
              />
              <div className="mt-1 rounded-lg border border-cyan-300/40 bg-cyan-950/60 p-2 font-mono text-[11px] text-cyan-100">
                <div>Motor: Html5Qrcode</div>
                <div>
                  Resultado barcode: {detectedBarcode ?? "NO DETECTADO"}
                </div>
                <div>
                  Tiempo total análisis:{" "}
                  {currentAnalysisDebug
                    ? `${(currentAnalysisDebug.totalMs / 1000).toFixed(2)} s`
                    : "—"}
                </div>
                <div>
                  Dispositivo:{" "}
                  {typeof navigator !== "undefined" ? navigator.userAgent : "—"}
                </div>
              </div>
              <p className="text-white/70">
                Texto:{" "}
                {currentAnalysis.text
                  ? currentAnalysis.text.slice(0, 180)
                  : "OCR desactivado en esta prueba"}
              </p>
              {companyMismatch && (
                <div className="rounded-xl border-2 border-red-300 bg-red-700 p-3 text-sm font-bold text-white shadow-lg">
                  ⚠️ POSIBLE ARTÍCULO DE OTRA EMPRESA: el código{" "}
                  {detectedDtsCode} corresponde a DTS{detectedDtsCode}, pero el
                  envío pertenece a {shipmentCompanyCode}. Verifique antes de
                  entregar; los casos excepcionales quedarán auditados.
                  <label className="mt-3 grid gap-1 text-xs font-medium">
                    <span>Justificación obligatoria para continuar</span>
                    <textarea
                      value={current.companyMismatchJustification}
                      maxLength={500}
                      onChange={(event) =>
                        setItems((currentItems) =>
                          currentItems.map((item) =>
                            item.id === current.id
                              ? {
                                  ...item,
                                  companyMismatchJustification:
                                    event.target.value,
                                }
                              : item,
                          ),
                        )
                      }
                      placeholder="Explique por qué se acepta este artículo de otra empresa"
                      className="min-h-18 rounded-lg border border-red-200 bg-white p-2 text-slate-900"
                    />
                  </label>
                </div>
              )}
              {shipmentItems.length > 0 && (
                <label className="mt-1 grid gap-1 text-white/80">
                  <span>Artículo del envío</span>
                  <select
                    value={current.shipmentItemId ?? ""}
                    onChange={(event) =>
                      setItems((currentItems) =>
                        currentItems.map((item) =>
                          item.id === current.id
                            ? {
                                ...item,
                                shipmentItemId: event.target.value || null,
                              }
                            : item,
                        ),
                      )
                    }
                    className="rounded-lg border border-white/30 bg-black/50 px-2 py-1.5 text-white"
                  >
                    <option value="">Seleccione un artículo</option>
                    {shipmentItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.productName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          ) : null}
        </div>
        {/* Miniaturas */}

        <div
          className="
    mb-2

    flex
    gap-2

    overflow-x-auto
  "
        >
          {items.map((evidence, i) => (
            <div
              key={evidence.id}
              className="
        relative
        shrink-0
      "
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  const nextItems = items.filter((x) => x.id !== evidence.id);

                  if (evidence.thumbnailUrl) {
                    URL.revokeObjectURL(evidence.thumbnailUrl);
                    thumbnailUrlsRef.current.delete(evidence.thumbnailUrl);
                    thumbnailEvidenceIdsRef.current.delete(evidence.id);
                  }

                  if (nextItems.length === 0) {
                    onClose();

                    return;
                  }

                  setItems(nextItems);

                  if (index >= nextItems.length) {
                    setIndex(nextItems.length - 1);
                  }
                }}
                className="
          absolute
          top-0.5
          right-0.5

          z-20

          w-5
          h-5

          rounded-full

          bg-red-500/60
          backdrop-blur

          text-white

          text-sm
          font-bold

          flex
          items-center
          justify-center
        "
              >
                ×
              </button>

              {evidence.hd && (
                <div
                  className="
            absolute

            bottom-0.5
            right-0.5

            bg-blue-600/60
            backdrop-blur

            text-white

            text-[10px]

            px-1.5
            py-0.5

            rounded

            z-10
          "
                >
                  HD
                </div>
              )}

              {evidence.notes && evidence.notes.trim() && (
                <div
                  className="
              absolute

              bottom-0.5
              left-0.5

              bg-black/40
              backdrop-blur

              text-white

              text-[10px]

              px-1.5
              py-0.5

              rounded

              z-10
            "
                >
                  💬
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                }}
              >
                {evidence.thumbnailUrl ? (
                  <img
                    src={evidence.thumbnailUrl}
                    alt=""
                    className={`
              h-17
              w-17
              rounded-lg
              border-2
              object-cover
              ${i === index ? "border-blue-600" : "border-white/30"}
            `}
                  />
                ) : (
                  <div
                    className={`
              flex
              h-17
              w-17
              items-center
              justify-center
              rounded-lg
              border-2
              bg-white/10
              text-xs
              text-white/60
              ${i === index ? "border-blue-600" : "border-white/30"}
            `}
                  >
                    …
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
        {/* Comentario + Enviar */}

        <div
          className="
      flex
      items-end
      gap-2
    "
        >
          <textarea
            ref={textareaRef}
            value={current.notes}
            maxLength={500}
            rows={1}
            placeholder="Añade un comentario..."
            onChange={(e) => {
              autoGrowTextarea(e.currentTarget);

              const copy = [...items];

              copy[index] = {
                ...copy[index],
                notes: e.target.value,
              };

              setItems(copy);
            }}
            onInput={(e) => autoGrowTextarea(e.currentTarget)}
            className="
        flex-1

        min-h-[48px]
        max-h-[120px]

        rounded-3xl

        bg-black/70
        backdrop-blur

        text-white

        px-4
        py-3

        resize-none

        overflow-y-auto

        outline-none

        placeholder:text-white/60
      "
          />

          <button
            type="button"
            onClick={async () => {
              if (
                isUploading ||
                hasPendingAnalysis ||
                hasUnjustifiedCompanyMismatch
              ) {
                return;
              }

              setThumbnailGenerationPaused(true);

              try {
                await imageWorkQueueRef.current;
                await onUpload(items);
              } finally {
                setThumbnailGenerationPaused(false);
              }
            }}
            disabled={
              isUploading || hasPendingAnalysis || hasUnjustifiedCompanyMismatch
            }
            title={
              hasPendingAnalysis
                ? "Espere a que termine la lectura de las imágenes"
                : hasUnjustifiedCompanyMismatch
                  ? "Indique la justificación de la excepción"
                  : "Subir evidencias"
            }
            className="
    w-16
    h-16

    shrink-0

    rounded-full

    bg-green-500

    text-white

    flex
    items-center
    justify-center

    shadow-xl
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
          >
            ↑
          </button>
        </div>
      </div>

      <EvidenceCropDialogCanvas
        open={cropOpen}
        imageUrl={cropImageUrl}
        initialRotation={current.rotation}
        initialFlipX={current.flipX}
        initialFlipY={current.flipY}
        initialCrop={{
          x: current.cropX,
          y: current.cropY,
          width: current.cropWidth,
          height: current.cropHeight,
        }}
        onClose={closeCropDialog}
        onApply={(crop) => {
          const copy = [...items];

          copy[index] = {
            ...copy[index],
            cropX: crop.x,
            cropY: crop.y,
            cropWidth: crop.width,
            cropHeight: crop.height,
            rotation: crop.rotation,
            flipX: crop.flipX,
            flipY: crop.flipY,
          };

          setItems(copy);
          closeCropDialog();
        }}
      />
      <BarcodeLiveScannerDialog
        open={liveScannerOpen}
        onClose={() => setLiveScannerOpen(false)}
        onDetected={(barcode) => {
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === current.id
                ? { ...item, detectedBarcode: barcode }
                : item,
            ),
          );
          setLiveScannerOpen(false);
          toast.success("Código de barras leído");
        }}
      />
    </div>
  );
}

function AnalysisValue({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/70">{label}:</span>
      <span className="font-mono font-semibold">{value ?? "No detectado"}</span>
      {value && (
        <button
          type="button"
          title={`Copiar ${label.toLowerCase()}`}
          aria-label={`Copiar ${label.toLowerCase()}`}
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copiado`);
          }}
          className="rounded p-1 text-white hover:bg-white/15"
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  );
}
