"use client";

import { useEffect, useState, useRef } from "react";
//import { ImageViewer } from "./image-viewer";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Crop,
  RefreshCcw,
} from "lucide-react";

import type { PendingEvidence } from "../../types/pending-evidence";
import { EvidenceCropDialogCanvas } from "./crop-dialog/evidence-crop-dialog-canvas";
import { processImage } from "@/shared/utils/process-image";
import { generateThumbnail } from "../../utils/generate-thumbnail";
type Props = {
  open: boolean;

  evidences: PendingEvidence[];

  onClose: () => void;

  onUpload: (evidences: PendingEvidence[]) => Promise<void>;

  isUploading?: boolean;
};

export function ShipmentEvidenceEditor({
  open,
  evidences,
  onClose,
  onUpload,
  isUploading = false,
}: Props) {
  const [cropOpen, setCropOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<PendingEvidence[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState("");
  const [activePreviewLoading, setActivePreviewLoading] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [thumbnailGenerationPaused, setThumbnailGenerationPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activePreviewUrlRef = useRef("");
  const cropImageUrlRef = useRef("");
  const thumbnailUrlsRef = useRef(new Set<string>());
  const thumbnailEvidenceIdsRef = useRef(new Set<string>());
  const imageWorkQueueRef = useRef<Promise<void>>(Promise.resolve());

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

    const thumbnailUrls = thumbnailUrlsRef.current;
    const thumbnailEvidenceIds = thumbnailEvidenceIdsRef.current;

    return () => {
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
        setItems(evidences);
        setIndex(0);
      }
    }

    void initializeEditor();

    return () => {
      cancelled = true;
    };
  }, [open, evidences]);

  if (!open || items.length === 0) {
    return null;
  }

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
              if (isUploading) {
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
            disabled={isUploading}
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
    </div>
  );
}
