"use client";

import { useEffect, useState, useRef } from "react";
//import { ImageViewer } from "./image-viewer";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Crop,
  RefreshCcw,
  ScanBarcode,
} from "lucide-react";

import type { PendingEvidence } from "../../types/pending-evidence";
import { EvidenceCropDialogCanvas } from "./crop-dialog/evidence-crop-dialog-canvas";
import { processImage } from "@/shared/utils/process-image";
import { editorAsset, originalFor } from "../../services/editor-image-assets";
import { type EvidenceImageAnalysis } from "../../utils/analyze-evidence-image";
import {
  scanSimpleBarcodeBatch,
  type BatchProgress,
  type BarcodeMetrics,
} from "../../utils/simple-barcode-batch";
import { toast } from "sonner";
import { BarcodeLiveScannerDialog } from "../barcode-live-scanner-dialog";

type Props = {
  open: boolean;

  evidences: PendingEvidence[];

  onClose: () => void;

  onUpload: (evidences: PendingEvidence[]) => Promise<void>;

  onRemoveEvidence?: (evidenceId: string) => void;

  isUploading?: boolean;
  shipmentItems?: Array<{ id: string; productName: string }>;
  shipmentCompanyCode?: string | null;
  submitLabel?: string;
  onItemsChange?: (items: PendingEvidence[]) => void;
};

export function ShipmentEvidenceEditor({
  open,
  evidences,
  onClose,
  onUpload,
  onRemoveEvidence,
  isUploading = false,
  shipmentItems = [],
  shipmentCompanyCode,
  submitLabel = "Subir evidencias",
  onItemsChange,
}: Props) {
  const [cropOpen, setCropOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<PendingEvidence[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState("");
  const [activePreviewLoading, setActivePreviewLoading] = useState(false);
  const [fullscreenPreviewOpen, setFullscreenPreviewOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [thumbnailGenerationPaused, setThumbnailGenerationPaused] =
    useState(false);
  const [analysisByEvidenceId, setAnalysisByEvidenceId] = useState<
    Record<string, EvidenceImageAnalysis | "loading">
  >({});
  const [liveScannerOpen, setLiveScannerOpen] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const batchControllerRef = useRef<AbortController | null>(null);

  const touchStartX = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activePreviewUrlRef = useRef("");
  const cropImageUrlRef = useRef("");
  const thumbnailUrlsRef = useRef(new Set<string>());
  const thumbnailEvidenceIdsRef = useRef(new Set<string>());
  const imageWorkQueueRef = useRef<Promise<void>>(Promise.resolve());
  const analyzedEvidenceIdsRef = useRef(new Set<string>());
  const analysisRerunRequestedRef = useRef(false);
  const cleanupTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open && items.length) onItemsChange?.(items);
  }, [items, open, onItemsChange]);

  const current = items[index];
  const currentId = current?.id;
  const currentOriginalFile = current?.originalFile;
  const currentStoredLocally = current?.storedLocally;
  const currentHd = current?.hd;
  const currentRotation = current?.rotation;
  const currentFlipX = current?.flipX;
  const currentFlipY = current?.flipY;
  const currentCropX = current?.cropX;
  const currentCropY = current?.cropY;
  const currentCropWidth = current?.cropWidth;
  const currentCropHeight = current?.cropHeight;

  function normalizeBarcodeOptions(...groups: Array<Array<string | null | undefined>>) {
    const candidates = groups
      .flat()
      .map((barcode) => barcode?.trim())
      .filter((barcode): barcode is string => Boolean(barcode));

    return Array.from(new Set(candidates)).sort(
      (left, right) => right.length - left.length || left.localeCompare(right),
    );
  }

  function preferredBarcode(options: string[]) {
    return options[0] ?? null;
  }

  function applyBarcodeResult(
    metrics: BarcodeMetrics,
    preferNewResult = false,
  ) {
    analyzedEvidenceIdsRef.current.add(metrics.id);
    const analysis: EvidenceImageAnalysis = {
      barcode: metrics.barcode,
      text: "",
      internalCompanyCode: null,
      barcodeMs: metrics.scanMs,
      ocrMs: 0,
      totalMs: metrics.optimizationMs + metrics.scanMs,
    };

    setAnalysisByEvidenceId((previous) => ({
      ...previous,
      [metrics.id]: analysis,
    }));
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== metrics.id) return item;
        const barcodeOptions = normalizeBarcodeOptions(
          item.barcodeOptions,
          [item.detectedBarcode, metrics.barcode],
        );
        return {
          ...item,
          scanCompleted: true,
          barcodeOptions,
          detectedBarcode:
            preferNewResult && metrics.barcode
              ? metrics.barcode
              : preferredBarcode(barcodeOptions),
        };
      }),
    );
  }
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
        const processedFile = await editorAsset({
          id: currentId!, originalFile: currentOriginalFile, storedLocally: currentStoredLocally,
          hd: currentHd ?? false, rotation: currentRotation ?? 0,
          flipX: currentFlipX ?? false, flipY: currentFlipY ?? false,
          cropX: currentCropX ?? 0, cropY: currentCropY ?? 0,
          cropWidth: currentCropWidth ?? 0, cropHeight: currentCropHeight ?? 0,
        } as PendingEvidence);

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
    currentStoredLocally,
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
            return editorAsset(evidence, true);
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

    if (cropImageUrlRef.current) {
      URL.revokeObjectURL(cropImageUrlRef.current);
    }

    let source: File;
    try { source = await originalFor(current); } catch {
      setThumbnailGenerationPaused(false);
      toast.error("No fue posible cargar la imagen para recortar");
      return;
    }
    const nextUrl = URL.createObjectURL(source);
    cropImageUrlRef.current = nextUrl;
    setCropImageUrl(nextUrl);
    setCropOpen(true);
  }
  useEffect(() => {
    if (!open) return;

    // The parent owns the evidence collection; merge its new entries into local edits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((currentItems) => {
      const currentById = new Map(
        currentItems.map((item) => [item.id, item]),
      );

      return evidences.map((evidence) => {
        const existing = currentById.get(evidence.id);

        if (existing) {
          return existing;
        }

        return {
          ...evidence,
          shipmentItemId:
            evidence.shipmentItemId ??
            (shipmentItems.length === 1
              ? shipmentItems[0].id
              : null),
        };
      });
    });

    setIndex((currentIndex) => {
      if (evidences.length === 0) {
        return 0;
      }

      return Math.min(
        currentIndex,
        evidences.length - 1,
      );
    });
  }, [open, evidences, shipmentItems]);

  useEffect(() => {
    if (!open) return;

    return () => { batchControllerRef.current?.abort(); };
  }, [open]);

  async function analyzeNewImages() {
    if (batchControllerRef.current) {
      analysisRerunRequestedRef.current = true;
      return;
    }

    const pending = items.filter(
      (item) => !item.scanCompleted && !analyzedEvidenceIdsRef.current.has(item.id),
    );
    if (!pending.length) return;
    const controller = new AbortController();
    batchControllerRef.current = controller;
    setBatchBusy(true);
    setBatchProgress({ phase: "optimizing", completed: 0, total: pending.length });
    setAnalysisByEvidenceId(previous => ({
      ...previous,
      ...Object.fromEntries(pending.map(item => [item.id, "loading" as const])),
    }));
    try {
      await scanSimpleBarcodeBatch(
        pending.map(item => ({ id: item.id, file: item.originalFile, loadFile: () => originalFor(item), hd: item.hd })),
        {
          signal: controller.signal,
          onProgress: (progress) => setBatchProgress(progress),
          onResult: metrics => {
            if (controller.signal.aborted) return;
            applyBarcodeResult(metrics);
          },
        },
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("[Barcode batch]", error);
      }
    } finally {
      if (batchControllerRef.current === controller) {
        batchControllerRef.current = null;
        setBatchBusy(false);
        setBatchProgress(null);

        if (analysisRerunRequestedRef.current) {
          analysisRerunRequestedRef.current = false;
        }
      }
    }
  }

  async function retryBarcodeForImage(item: PendingEvidence) {
    if (batchControllerRef.current) return;

    const controller = new AbortController();
    batchControllerRef.current = controller;
    setBatchBusy(true);
    setBatchProgress({ phase: "optimizing", completed: 0, total: 1 });
    setAnalysisByEvidenceId((previous) => ({
      ...previous,
      [item.id]: "loading",
    }));

    try {
      const transformedFile = await processImage(await originalFor(item), {
        hd: item.hd,
        rotation: item.rotation,
        flipX: item.flipX,
        flipY: item.flipY,
        cropX: item.cropX,
        cropY: item.cropY,
        cropWidth: item.cropWidth || 1,
        cropHeight: item.cropHeight || 1,
      });
      controller.signal.throwIfAborted();

      await scanSimpleBarcodeBatch(
        [{ id: item.id, file: transformedFile, hd: item.hd }],
        {
          signal: controller.signal,
          onProgress: (progress) => setBatchProgress(progress),
          onResult: (metrics) => {
            if (!controller.signal.aborted) {
              applyBarcodeResult(metrics, true);
            }
          },
        },
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("[Barcode retry]", error);
        analyzedEvidenceIdsRef.current.add(item.id);
        setAnalysisByEvidenceId((previous) => ({
          ...previous,
          [item.id]: {
            barcode: item.detectedBarcode,
            text: "",
            internalCompanyCode: null,
            barcodeMs: 0,
            ocrMs: 0,
            totalMs: 0,
          },
        }));
      }
    } finally {
      if (batchControllerRef.current === controller) {
        batchControllerRef.current = null;
        setBatchBusy(false);
        setBatchProgress(null);
      }
    }
  }

  useEffect(() => {
    if (!open || items.length === 0 || batchBusy) {
      return;
    }

    const hasUnanalyzedImages = items.some(
      (item) => !item.scanCompleted && !analyzedEvidenceIdsRef.current.has(item.id),
    );

    if (!hasUnanalyzedImages) {
      return;
    }

    void analyzeNewImages();
    // The batch reads the current item snapshot; recreating the function is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items, batchBusy]);

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => {
      analyzedEvidenceIdsRef.current.clear();
      analysisRerunRequestedRef.current = false;
      setAnalysisByEvidenceId({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open || items.length === 0) {
    return null;
  }

  const progressTotal = batchProgress?.total ?? 0;
  const progressCompleted = batchProgress?.completed ?? 0;
  const progressPercent = progressTotal > 0
    ? Math.round((progressCompleted / progressTotal) * 100)
    : 0;
  const progressImage = progressTotal > 0
    ? Math.min(progressCompleted + 1, progressTotal)
    : 0;

  const currentAnalysis = current
    ? analysisByEvidenceId[current.id]
    : undefined;
  const hasPendingAnalysis = items.some(
    (item) =>
      analysisByEvidenceId[item.id] === "loading" ||
      (!item.scanCompleted && !analysisByEvidenceId[item.id]),
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
      {/* Overlay superior */}

      <div
        className="
    absolute
    top-4
    left-4
    right-4

    z-40

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
        px-4
        h-11

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
    w-11
    h-11

    rounded-full

    bg-black/40
    backdrop-blur

    text-white

    flex
    items-center
    justify-center
  "
          >
            <Crop size={20} />
          </button>
        </div>
      </div>

      {/* Imagen */}

      <div
        className="
    absolute
    inset-0

    lg:right-[22rem]

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
                  className="block max-h-full max-w-full cursor-zoom-in object-contain md:cursor-default"
                  onClick={() => {
                    if (window.matchMedia("(max-width: 767px)").matches) {
                      setFullscreenPreviewOpen(true);
                    }
                  }}
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
        <div className="pointer-events-none absolute inset-y-0 left-4 right-4 z-20 hidden items-center justify-between md:flex lg:right-[23rem]">
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

    lg:top-20
    lg:right-6
    lg:bottom-6
    lg:left-auto
    lg:flex
    lg:w-80
    lg:flex-col
    lg:overflow-y-auto
  "
      >
        <div className="mb-2 text-white">
          <div className="flex gap-2">
            {current.barcodeOptions.length > 1 ? (
              <select
                aria-label="Código de barras detectado"
                value={detectedBarcode ?? current.barcodeOptions[0]}
                onChange={(event) =>
                  setItems((previous) => previous.map((item) =>
                    item.id === current.id
                      ? { ...item, detectedBarcode: event.target.value || null }
                      : item,
                  ))
                }
                className="min-w-0 flex-1 rounded-lg border border-white/35 bg-white px-3 py-2 font-mono text-sm text-slate-900"
              >
                {current.barcodeOptions.map((barcode) => (
                  <option key={barcode} value={barcode}>{barcode}</option>
                ))}
              </select>
            ) : (
              <input
                aria-label="Código de barras"
                value={detectedBarcode ?? ""}
                onChange={(event) => {
                  const barcode = event.target.value;
                  setItems((previous) => previous.map((item) => item.id === current.id
                    ? {
                        ...item,
                        detectedBarcode: barcode || null,
                        barcodeOptions: barcode
                          ? normalizeBarcodeOptions(item.barcodeOptions, [barcode])
                          : item.barcodeOptions,
                      }
                    : item));
                }}
                placeholder="Código de barras"
                className="min-w-0 flex-1 rounded-lg border border-white/35 bg-white px-3 py-2 font-mono text-sm text-slate-900"
              />
            )}
            <button
              type="button"
              onClick={() => void retryBarcodeForImage(current)}
              title="Volver a buscar el código en esta imagen"
              aria-label="Volver a buscar el código en esta imagen"
              disabled={batchBusy}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw size={17} />
            </button>
            <button
              type="button"
              onClick={() => setLiveScannerOpen(true)}
              title="Escanear código de barras con la cámara"
              aria-label="Escanear código de barras con la cámara"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white"
            >
              <ScanBarcode size={18} />
            </button>
          </div>
          {currentAnalysis !== "loading" && (
            <div className="mt-2 grid gap-1.5 text-xs">
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
              {shipmentItems.length > 1 && (
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
          )}
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

                  onRemoveEvidence?.(evidence.id);

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
                  : submitLabel
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

      {fullscreenPreviewOpen && activePreviewUrl && (
        <div
          className="fixed inset-0 z-[270] flex items-center justify-center bg-black p-3 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Vista de imagen a pantalla completa"
          onClick={() => setFullscreenPreviewOpen(false)}
        >
          <button
            type="button"
            className="absolute left-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg"
            onClick={() => setFullscreenPreviewOpen(false)}
            aria-label="Volver al editor"
            title="Volver al editor"
          >
            <ChevronLeft size={24} />
          </button>
          <img
            src={activePreviewUrl}
            alt="Vista de evidencia a pantalla completa"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      {batchProgress && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/70 p-6" role="status" aria-live="polite">
          <div className="w-full max-w-xs overflow-hidden rounded-3xl bg-zinc-800 shadow-2xl">
            <div className="bg-fuchsia-700 px-5 py-4 text-lg font-bold text-white">
              {batchProgress.phase === "optimizing" ? "Optimizando imágenes" : "Buscando códigos de barras"}
            </div>
            <div className="px-5 py-5 text-center">
              <p className="text-lg font-medium text-white/75">Imagen {progressImage} de {progressTotal}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-600">
                <div className="h-full bg-fuchsia-700 transition-[width] duration-200" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-4 text-lg font-medium text-fuchsia-500">{progressPercent}%</p>
            </div>
          </div>
        </div>
      )}

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
        onDetected={(barcodes) => {
          setItems((currentItems) =>
            currentItems.map((item) => {
              if (item.id !== current.id) return item;
              const barcodeOptions = normalizeBarcodeOptions(
                item.barcodeOptions,
                [item.detectedBarcode],
                barcodes,
              );
              return {
                ...item,
                barcodeOptions,
                detectedBarcode: barcodes[0]?.trim() || item.detectedBarcode,
              };
            }),
          );
          setLiveScannerOpen(false);
          toast.success("Código de barras leído");
        }}
      />
    </div>
  );
}
