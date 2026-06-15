"use client";

import { X, ZoomIn, ZoomOut } from "lucide-react";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { CachedEvidenceImage } from "./cached-evidence-image";
import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
type Props = {
  open: boolean;

  onClose: () => void;

  evidenceId?: string;

  shipmentId?: string;

  fileUrl?: string;

  imageUrl?: string;

  notes?: string | null;
};

export function EvidenceViewerDialog({
  open,
  onClose,
  evidenceId,
  shipmentId,
  fileUrl,
  notes,
  imageUrl,
}: Props) {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    if (!open) {
      return;
    }

    setRotation(0);
  }, [open, evidenceId]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-black
      "
    >
      {/* Cerrar */}
      <button
        onClick={onClose}
        className="
          absolute
          top-4
          right-4
          z-[300]
          p-3
          rounded-full
          bg-black/40
          backdrop-blur-sm
          text-white
          hover:bg-black/60
        "
      >
        <X size={28} />
      </button>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        doubleClick={{
          mode: "zoomIn",
        }}
        wheel={{
          step: 0.5,
        }}
        pinch={{
          step: 5,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Imagen */}
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
              "
            >
              <TransformComponent
                wrapperClass="
    !w-full
    !h-full
  "
              >
                <div
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 200ms ease",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="
      max-w-[95vw]
      max-h-[90vh]
      object-contain
    "
                    />
                  ) : (
                    <CachedEvidenceImage
                      evidenceId={evidenceId!}
                      shipmentId={shipmentId!}
                      fileUrl={fileUrl!}
                      className="
      max-w-[95vw]
      max-h-[90vh]
      object-contain
    "
                    />
                  )}
                </div>
              </TransformComponent>
            </div>

            {/* Controles flotantes */}
            <div
              className="
                absolute
                bottom-6
                left-1/2
                -translate-x-1/2
                z-[250]
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-full
                bg-black/40
                backdrop-blur-sm
              "
            >
              <button
                onClick={() => zoomOut()}
                className="
                  p-2
                  text-white
                "
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="
    p-2
    text-white
  "
              >
                <RotateCw size={20} />
              </button>
              <button
                onClick={() => resetTransform()}
                className="
                  px-3
                  py-1
                  text-xs
                  text-white
                "
              >
                Reset
              </button>

              <button
                onClick={() => zoomIn()}
                className="
                  p-2
                  text-white
                "
              >
                <ZoomIn size={20} />
              </button>
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Comentario */}
      {notes?.trim() && (
        <div
          className="
            absolute
            left-0
            right-0
            bottom-0
            z-[200]
            p-4
            text-white
            bg-black/50
            backdrop-blur-sm
          "
        >
          {notes}
        </div>
      )}
    </div>
  );
}
