"use client";

import { Rnd } from "react-rnd";
import { useEffect, useRef, useState } from "react";
type Props = {
  open: boolean;

  imageUrl: string;

  onClose: () => void;

  onApply: (result: {
    x: number;
    y: number;
    width: number;
    height: number;

    rotation: number;

    flipX: boolean;

    flipY: boolean;
  }) => void;

  initialCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  initialRotation?: number;

  initialFlipX?: boolean;

  initialFlipY?: boolean;
};

export function EvidenceCropDialog({
  open,
  imageUrl,
  initialCrop,

  initialRotation,
  initialFlipX,
  initialFlipY,

  onClose,
  onApply,
}: Props) {
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,

    width: 300,
    height: 300,
  });

  // =====================================================
  // Transformations
  // =====================================================

  const [rotation, setRotation] = useState(initialRotation ?? 0);

  const [flipX, setFlipX] = useState(initialFlipX ?? false);

  const [flipY, setFlipY] = useState(initialFlipY ?? false);
  // =====================================================
  // Sync transformations
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setRotation(initialRotation ?? 0);

    setFlipX(initialFlipX ?? false);

    setFlipY(initialFlipY ?? false);
  }, [open, initialRotation, initialFlipX, initialFlipY]);

  const imageRef = useRef<HTMLImageElement>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const imageBoundsRef = useRef<{
    width: number;
    height: number;

    left: number;
    top: number;
  }>({
    width: 0,

    height: 0,

    left: 0,

    top: 0,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const image = imageRef.current;

    if (!image) {
      return;
    }

    const updateCrop = () => {
      const rect = image.getBoundingClientRect();
      console.log({
        rotation,

        rectWidth: rect.width,
        rectHeight: rect.height,

        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });

      imageBoundsRef.current = {
        width: rect.width,

        height: rect.height,

        left: 0,

        top: 0,
      };

      const isLandscape = image.naturalWidth > image.naturalHeight;

      let width: number;

      let height: number;

      if (isLandscape) {
        width = rect.width * 0.8;

        height = width * (image.naturalHeight / image.naturalWidth);
      } else {
        height = rect.height * 0.8;

        width = height * (image.naturalWidth / image.naturalHeight);
      }

      // =====================================================
      // Restaurar crop previo
      // =====================================================

      if (initialCrop && initialCrop.width > 0 && initialCrop.height > 0) {
        setCropBox({
          x: initialCrop.x * rect.width,

          y: initialCrop.y * rect.height,

          width: initialCrop.width * rect.width,

          height: initialCrop.height * rect.height,
        });

        return;
      }

      // =====================================================
      // Crop inicial centrado
      // =====================================================

      setCropBox({
        x: 0,

        y: 0,

        width: rect.width,

        height: rect.height,
      });
    };

    if (image.complete) {
      updateCrop();
    }

    image.onload = updateCrop;
  }, [open, imageUrl, initialCrop]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
      fixed
      inset-0

      z-[500]

      overscroll-none
      touch-none

      bg-black
    "
    >
      <div
        ref={imageContainerRef}
        className="
        absolute
        inset-0

        flex
        items-center
        justify-center
      "
      >
        <div
          ref={frameRef}
          className="
          relative
          inline-block
        "
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt=""
            /*style={{
              transform: `
      rotate(${rotation}deg)
      scaleX(${flipX ? -1 : 1})
      scaleY(${flipY ? -1 : 1})
    `,
            }}*/
            className="
    max-w-[90vw]
    max-h-[80vh]

    object-contain

    pointer-events-none
    select-none
  "
          />

          {/* Overlay superior */}

          <div
            className="
            absolute
            left-0
            right-0

            bg-black/70

            pointer-events-none
          "
            style={{
              top: 0,
              height: cropBox.y,
            }}
          />

          {/* Overlay izquierdo */}

          <div
            className="
            absolute

            bg-black/70

            pointer-events-none
          "
            style={{
              left: 0,
              top: cropBox.y,

              width: cropBox.x,

              height: cropBox.height,
            }}
          />

          {/* Overlay derecho */}

          <div
            className="
            absolute

            bg-black/70

            pointer-events-none
          "
            style={{
              left: cropBox.x + cropBox.width,

              right: 0,

              top: cropBox.y,

              height: cropBox.height,
            }}
          />

          {/* Overlay inferior */}

          <div
            className="
            absolute
            left-0
            right-0

            bg-black/70

            pointer-events-none
          "
            style={{
              top: cropBox.y + cropBox.height,

              bottom: 0,
            }}
          />

          <Rnd
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,

              topLeft: true,
              topRight: true,
              bottomLeft: true,
              bottomRight: true,
            }}
            resizeHandleStyles={{
              top: {
                height: "40px",
              },

              bottom: {
                height: "40px",
              },

              left: {
                width: "40px",
              },

              right: {
                width: "40px",
              },

              topLeft: {
                width: "50px",
                height: "50px",
              },

              topRight: {
                width: "50px",
                height: "50px",
              },

              bottomLeft: {
                width: "50px",
                height: "50px",
              },

              bottomRight: {
                width: "50px",
                height: "50px",
              },
            }}
            bounds="parent"
            size={{
              width: cropBox.width,
              height: cropBox.height,
            }}
            position={{
              x: cropBox.x,
              y: cropBox.y,
            }}
            onDragStop={(_, data) => {
              setCropBox({
                ...cropBox,
                x: data.x,
                y: data.y,
              });
            }}
            onResizeStop={(_, __, ref, ___, position) => {
              setCropBox({
                width: parseInt(ref.style.width),

                height: parseInt(ref.style.height),

                x: position.x,

                y: position.y,
              });
            }}
          >
            <div
              className="
              w-full
              h-full

              border-2
              border-white

              bg-white/5

              relative
            "
            >
              <div className="absolute inset-0">
                <div
                  className="
                  absolute

                  top-1/3
                  left-0
                  right-0

                  border-t
                  border-white/40
                "
                />

                <div
                  className="
                  absolute

                  top-2/3
                  left-0
                  right-0

                  border-t
                  border-white/40
                "
                />

                <div
                  className="
                  absolute

                  left-1/3
                  top-0
                  bottom-0

                  border-l
                  border-white/40
                "
                />

                <div
                  className="
                  absolute

                  left-2/3
                  top-0
                  bottom-0

                  border-l
                  border-white/40
                "
                />
              </div>

              <div
                className="
                absolute
                -top-2
                -left-2

                w-5
                h-5

                border-2
                border-white

                bg-black
              "
              />

              <div
                className="
                absolute
                -top-2
                -right-2

                w-5
                h-5

                border-2
                border-white

                bg-black
              "
              />

              <div
                className="
                absolute
                -bottom-2
                -left-2

                w-5
                h-5

                border-2
                border-white

                bg-black
              "
              />

              <div
                className="
                absolute
                -bottom-2
                -right-2

                w-5
                h-5

                border-2
                border-white

                bg-black
              "
              />
            </div>
          </Rnd>
        </div>
      </div>

      {/* ===================================================== */}
      {/* Transform buttons                                     */}
      {/* ===================================================== */}

      <div
        className="
    absolute

    bottom-4
    left-0
    right-0

    flex
    justify-end
    gap-3

    px-4
  "
      >
        <button
          type="button"
          onClick={onClose}
          className="
      w-12
      h-12

      rounded-full

      bg-red-600

      text-white
    "
          title="Cerrar"
        >
          ✕
        </button>

        <button
          type="button"
          onClick={() => {
            const imageWidth = imageBoundsRef.current.width;

            const imageHeight = imageBoundsRef.current.height;

            onApply({
              x: cropBox.x / imageWidth,

              y: cropBox.y / imageHeight,

              width: cropBox.width / imageWidth,

              height: cropBox.height / imageHeight,

              rotation,

              flipX,

              flipY,
            });

            onClose();
          }}
          className="
      w-12
      h-12

      rounded-full

      bg-green-600

      text-white
    "
          title="Aceptar"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
