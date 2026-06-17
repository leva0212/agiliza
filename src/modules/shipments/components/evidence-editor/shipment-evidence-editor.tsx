"use client";

import { useEffect, useState, useRef } from "react";

import {
  X,
  RotateCw,
  FlipHorizontal,
  Crop,
  BadgeInfo,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";

import type { PendingEvidence } from "../../types/pending-evidence";
import { EvidenceCropDialog } from "./crop-dialog/evidence-crop-dialog";
import { processImage } from "@/shared/utils/process-image";
import { updateEvidencePreview } from "@/shared/utils/update-evidence-preview";
type Props = {
  open: boolean;

  evidences: PendingEvidence[];

  onClose: () => void;

  onUpload: (evidences: PendingEvidence[]) => Promise<void>;
};

export function ShipmentEvidenceEditor({
  open,
  evidences,
  onClose,
  onUpload,
}: Props) {
  const [cropOpen, setCropOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const [items, setItems] = useState<PendingEvidence[]>([]);

  const touchStartX = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const current = items[index];
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
  useEffect(() => {
    if (open) {
      setItems(evidences);

      setIndex(0);
    }
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
            onClick={async () => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                hd: !copy[index].hd,
              };
              copy[index] = await updateEvidencePreview(copy[index]);

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
            onClick={async () => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                rotation:  - 90,
              };

              copy[index] = await updateEvidencePreview(copy[index]);

              setItems(copy);
            }}
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
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={async () => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                rotation: 90,
              };

              copy[index] = await updateEvidencePreview(copy[index]);

              setItems(copy);
            }}
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
            <RotateCw size={18} />
          </button>

          <button
            type="button"
            onClick={async () => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                flipX: true,
              };

              copy[index] = await updateEvidencePreview(copy[index]);

              setItems(copy);
            }}
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
            <FlipHorizontal size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                file: copy[index].originalFile,

                previewUrl: copy[index].originalPreviewUrl,

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
            onClick={async () => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                flipY: true
              };

              copy[index] = await updateEvidencePreview(copy[index]);

              setItems(copy);
            }}
            className="
        w-10
        h-10
        rotate-90
        rounded-full

        bg-black/40
        backdrop-blur

        text-white

        flex
        items-center
        justify-center
      "
          >
            <FlipHorizontal size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              setCropOpen(true);
            }}
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
              <img
                src={current.previewUrl}
                alt=""
                className="
        max-w-full
        max-h-full

        object-contain
      "
              />
            </div>
          </div>
        </div>
      </div>

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
                <img
                  src={evidence.previewUrl}
                  alt=""
                  className={`
            w-17
            h-17

            object-cover

            rounded-lg

            border-2

            ${i === index ? "border-blue-600" : "border-white/30"}
          `}
                />
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
              await onUpload(items);
            }}
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
  "
          >
            ↑
          </button>
        </div>
      </div>
      <EvidenceCropDialog
        open={cropOpen}
        imageUrl={current.previewUrl}
        initialRotation={current.rotation}
        initialFlipX={current.flipX}
        initialFlipY={current.flipY}
        initialCrop={{
          x: current.cropX,
          y: current.cropY,

          width: current.cropWidth,
          height: current.cropHeight,
        }}
        onClose={() => {
          setCropOpen(false);
        }}
        onApply={async (crop) => {
          const copy = [...items];

          copy[index] = {
            ...copy[index],

            cropX: crop.x,
            cropY: crop.y,

            cropWidth: crop.width,
            cropHeight: crop.height,
          };

          copy[index] = await updateEvidencePreview(copy[index]);

          setItems(copy);
        }}
      />
    </div>
  );
}
