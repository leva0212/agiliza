"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;

  imageUrl: string;

  initialRotation?: number;

  initialFlipX?: boolean;

  initialFlipY?: boolean;

  initialCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

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
};

export function EvidenceCropDialogCanvas({
  open,
  imageUrl,

  initialRotation = 0,
  initialFlipX = false,
  initialFlipY = false,

  initialCrop,

  onClose,
  onApply,
}: Props) {
  const draggingRef = useRef(false);

  const dragOffsetRef = useRef({
    x: 0,
    y: 0,
  });

  type ResizeHandle = "none" | "nw" | "ne" | "sw" | "se";

  const activeHandleRef = useRef<ResizeHandle>("none");

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function getResizeHandle(x: number, y: number): ResizeHandle {
    const HANDLE_SIZE = 20;

    if (
      Math.abs(x - cropBox.x) <= HANDLE_SIZE &&
      Math.abs(y - cropBox.y) <= HANDLE_SIZE
    ) {
      return "nw";
    }

    if (
      Math.abs(x - (cropBox.x + cropBox.width)) <= HANDLE_SIZE &&
      Math.abs(y - cropBox.y) <= HANDLE_SIZE
    ) {
      return "ne";
    }

    if (
      Math.abs(x - cropBox.x) <= HANDLE_SIZE &&
      Math.abs(y - (cropBox.y + cropBox.height)) <= HANDLE_SIZE
    ) {
      return "sw";
    }

    if (
      Math.abs(x - (cropBox.x + cropBox.width)) <= HANDLE_SIZE &&
      Math.abs(y - (cropBox.y + cropBox.height)) <= HANDLE_SIZE
    ) {
      return "se";
    }

    return "none";
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const visibleImageRef = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [cropBox, setCropBox] = useState({
    x: 50,
    y: 50,
    width: 300,
    height: 300,
  });

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const [rotation, setRotation] = useState(initialRotation);

  const [flipX, setFlipX] = useState(initialFlipX);

  const [flipY, setFlipY] = useState(initialFlipY);

  function calculateCanvasSize(
    imageWidth: number,
    imageHeight: number,
    rotation: number,
  ) {
    const visibleViewport = window.visualViewport;
    const viewportWidth = visibleViewport?.width ?? window.innerWidth;
    const viewportHeight = visibleViewport?.height ?? window.innerHeight;
    const isMobileViewport = viewportWidth < 768;

    // On mobile, reserve room for the top edit controls and bottom actions.
    // visualViewport reflects the area that remains visible below browser UI.
    const maxWidth = isMobileViewport
      ? Math.max(160, viewportWidth - 32)
      : viewportWidth * 0.9;

    const maxHeight = isMobileViewport
      ? Math.max(160, viewportHeight - 160)
      : viewportHeight * 0.8;

    const normalizedRotation = ((rotation % 360) + 360) % 360;

    const rotated = normalizedRotation === 90 || normalizedRotation === 270;

    // Fit the already-oriented image. Fitting first and swapping dimensions
    // afterward lets a rotated vertical image overflow a narrow mobile screen.
    const orientedWidth = rotated ? imageHeight : imageWidth;
    const orientedHeight = rotated ? imageWidth : imageHeight;

    const ratio = Math.min(
      maxWidth / orientedWidth,
      maxHeight / orientedHeight,
      1,
    );

    const width = orientedWidth * ratio;
    const height = orientedHeight * ratio;

    return {
      width,

      height,

      imageWidth: width,

      imageHeight: height,
    };
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    setRotation(initialRotation);

    setFlipX(initialFlipX);

    setFlipY(initialFlipY);

    const image = new Image();

    image.onload = () => {
   

      imageRef.current = image;

      const size = calculateCanvasSize(
        image.width,
        image.height,
        initialRotation,
      );

      setCanvasSize({
        width: size.width,

        height: size.height,
      });

     

      if (initialCrop && initialCrop.width > 0 && initialCrop.height > 0) {
        const restoredCrop = {
          x: initialCrop.x * size.width,

          y: initialCrop.y * size.height,

          width: initialCrop.width * size.width,

          height: initialCrop.height * size.height,
        };



        setCropBox(restoredCrop);

      } else {
        setCropBox({
          x: 0,

          y: 0,

          width: size.imageWidth,

          height: size.imageHeight,
        });
      }
    };

    image.src = imageUrl;
  }, [
    open,
    imageUrl,
    initialCrop,
    initialRotation,
    initialFlipX,
    initialFlipY,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updateCanvasSize = () => {
      if (!imageRef.current) {
        return;
      }

      const size = calculateCanvasSize(
        imageRef.current.width,
        imageRef.current.height,
        rotation,
      );

      setCanvasSize({
        width: size.width,

        height: size.height,
      });
    };

    updateCanvasSize();

    const visibleViewport = window.visualViewport;

    window.addEventListener("resize", updateCanvasSize);
    visibleViewport?.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      visibleViewport?.removeEventListener("resize", updateCanvasSize);
    };
  }, [open, rotation]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const image = imageRef.current;

    if (!canvas || !image || !canvasSize.width) {
      return;
    }

    canvas.width = canvasSize.width;

    canvas.height = canvasSize.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const context = ctx;

    const HANDLE_SIZE = 20;

    function drawHandle(x: number, y: number) {
      context.fillStyle = "#ffffff";

      context.fillRect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE,
      );
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // =====================================================
    // Imagen
    // =====================================================

    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate((rotation * Math.PI) / 180);

    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    const normalizedRotation = ((rotation % 360) + 360) % 360;

    const rotated90 = normalizedRotation === 90 || normalizedRotation === 270;

    const fitWidth = rotated90 ? image.height : image.width;

    const fitHeight = rotated90 ? image.width : image.height;

    const scale = Math.min(canvas.width / fitWidth, canvas.height / fitHeight);

    const drawWidth = image.width * scale;

    const drawHeight = image.height * scale;

    
    visibleImageRef.current = {
      x: 0,

      y: 0,

      width: canvas.width,

      height: canvas.height,
    };


  
    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    ctx.restore();

    // =====================================================
    // Sombra exterior
    // =====================================================

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.7)";

    ctx.beginPath();

    ctx.rect(0, 0, canvas.width, canvas.height);

    ctx.rect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

    ctx.fill("evenodd");

    ctx.restore();

    // =====================================================
    // Borde crop
    // =====================================================

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 2;

    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
   

    // =====================================================
    // Handles
    // =====================================================

    drawHandle(cropBox.x, cropBox.y);

    drawHandle(cropBox.x + cropBox.width, cropBox.y);

    drawHandle(cropBox.x, cropBox.y + cropBox.height);

    drawHandle(cropBox.x + cropBox.width, cropBox.y + cropBox.height);

    // =====================================================
    // Guías regla de tercios
    // =====================================================

    ctx.strokeStyle = "rgba(255,255,255,0.4)";

    ctx.lineWidth = 1;

    for (let i = 1; i <= 2; i++) {
      // horizontales

      ctx.beginPath();

      ctx.moveTo(cropBox.x, cropBox.y + (cropBox.height / 3) * i);

      ctx.lineTo(
        cropBox.x + cropBox.width,
        cropBox.y + (cropBox.height / 3) * i,
      );

      ctx.stroke();

      // verticales

      ctx.beginPath();

      ctx.moveTo(cropBox.x + (cropBox.width / 3) * i, cropBox.y);

      ctx.lineTo(
        cropBox.x + (cropBox.width / 3) * i,
        cropBox.y + cropBox.height,
      );

      ctx.stroke();
    }
  }, [cropBox, canvasSize, rotation, flipX, flipY]);
  if (!open) {
    return null;
  }

  return (
    <div
      className="
      fixed
      inset-0
      z-[500]
      bg-black

      flex
      items-center
      justify-center
    "
    >
      <div
        className="
    absolute
    top-4
    left-1/2
    -translate-x-1/2

    flex
    gap-2

    z-10
  "
      >
        <button
          type="button"
          onClick={() => {
            const nextRotation = rotation - 90;
            const image = imageRef.current;
            const nextSize = image
              ? calculateCanvasSize(image.width, image.height, nextRotation)
              : canvasSize;
            const previousWidth = Math.max(canvasSize.width, 1);
            const previousHeight = Math.max(canvasSize.height, 1);

            setCropBox((prev) => ({
              x: (prev.y / previousHeight) * nextSize.width,

              y:
                ((previousWidth - (prev.x + prev.width)) / previousWidth) *
                nextSize.height,

              width: (prev.height / previousHeight) * nextSize.width,

              height: (prev.width / previousWidth) * nextSize.height,
            }));

            setRotation(nextRotation);
          }}
          className="
      w-12
      h-12

      rounded-full

      bg-black/70

      text-white
    "
        >
          ↺
        </button>

        <button
          type="button"
          onClick={() => {
            const nextRotation = rotation + 90;
            const image = imageRef.current;
            const nextSize = image
              ? calculateCanvasSize(image.width, image.height, nextRotation)
              : canvasSize;
            const previousWidth = Math.max(canvasSize.width, 1);
            const previousHeight = Math.max(canvasSize.height, 1);

            setCropBox((prev) => ({
              x:
                ((previousHeight - (prev.y + prev.height)) / previousHeight) *
                nextSize.width,

              y: (prev.x / previousWidth) * nextSize.height,

              width: (prev.height / previousHeight) * nextSize.width,

              height: (prev.width / previousWidth) * nextSize.height,
            }));

            setRotation(nextRotation);
          }}
          className="
      w-12
      h-12

      rounded-full

      bg-black/70

      text-white
    "
        >
          ↻
        </button>

        <button
          type="button"
          onClick={() => {
            setFlipX((prev) => !prev);
          }}
          className="
      w-12
      h-12

      rounded-full

      bg-black/70

      text-white
    "
        >
          ⇋
        </button>

        <button
          type="button"
          onClick={() => {
            setFlipY((prev) => !prev);
          }}
          className="
      w-12
      h-12

      rounded-full

      bg-black/70

      text-white
    "
        >
          ⇅
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="
    border
    border-white
    touch-none
  "
        onPointerDown={(event) => {
          const point = getCanvasPoint(event);

          activeHandleRef.current = getResizeHandle(point.x, point.y);

   

          //const point = getCanvasPoint(event);

          const insideCrop =
            point.x >= cropBox.x &&
            point.x <= cropBox.x + cropBox.width &&
            point.y >= cropBox.y &&
            point.y <= cropBox.y + cropBox.height;

          if (!insideCrop) {
            return;
          }

          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);

          dragOffsetRef.current = {
            x: point.x - cropBox.x,
            y: point.y - cropBox.y,
          };
        }}
        onPointerMove={(event) => {
          const point = getCanvasPoint(event);

          if (draggingRef.current && activeHandleRef.current === "none") {
            const imageArea = visibleImageRef.current;

            setCropBox((prev) => ({
              ...prev,

              x: Math.max(
                imageArea.x,
                Math.min(
                  imageArea.x + imageArea.width - prev.width,
                  point.x - dragOffsetRef.current.x,
                ),
              ),

              y: Math.max(
                imageArea.y,
                Math.min(
                  imageArea.y + imageArea.height - prev.height,
                  point.y - dragOffsetRef.current.y,
                ),
              ),
            }));

            return;
          }
          const MIN_SIZE = 50;

          const imageArea = visibleImageRef.current;

          setCropBox((prev) => {
            switch (activeHandleRef.current) {
              // ============================
              // Inferior derecha
              // ============================

              case "se":
                return {
                  ...prev,

                  width: Math.max(
                    MIN_SIZE,
                    Math.min(
                      imageArea.x + imageArea.width - prev.x,
                      point.x - prev.x,
                    ),
                  ),

                  height: Math.max(
                    MIN_SIZE,
                    Math.min(
                      imageArea.y + imageArea.height - prev.y,
                      point.y - prev.y,
                    ),
                  ),
                };
              // ============================
              // Superior izquierda
              // ============================

              case "nw": {
                const newX = Math.min(
                  prev.x + prev.width - MIN_SIZE,
                  Math.max(imageArea.x, point.x),
                );

                const newY = Math.min(
                  prev.y + prev.height - MIN_SIZE,
                  Math.max(imageArea.y, point.y),
                );

                return {
                  x: newX,

                  y: newY,

                  width: prev.width + (prev.x - newX),

                  height: prev.height + (prev.y - newY),
                };
              }

              // ============================
              // Superior derecha
              // ============================

              case "ne": {
                const newY = Math.min(
                  prev.y + prev.height - MIN_SIZE,
                  Math.max(imageArea.y, point.y),
                );

                return {
                  x: prev.x,

                  y: newY,

                  width: Math.max(
                    MIN_SIZE,
                    Math.min(
                      imageArea.x + imageArea.width - prev.x,
                      point.x - prev.x,
                    ),
                  ),

                  height: prev.height + (prev.y - newY),
                };
              }

              // ============================
              // Inferior izquierda
              // ============================

              case "sw": {
                const newX = Math.min(
                  prev.x + prev.width - MIN_SIZE,
                  Math.max(imageArea.x, point.x),
                );

                return {
                  x: newX,

                  y: prev.y,

                  width: prev.width + (prev.x - newX),

                  height: Math.max(
                    MIN_SIZE,
                    Math.min(
                      imageArea.y + imageArea.height - prev.y,
                      point.y - prev.y,
                    ),
                  ),
                };
              }

              default:
                return prev;
            }
          });
        }}
        onPointerUp={() => {
          draggingRef.current = false;

          activeHandleRef.current = "none";
        }}
        onPointerLeave={() => {
          draggingRef.current = false;

          activeHandleRef.current = "none";
        }}
      />

      <div
        className="
        absolute
        bottom-4
        right-4

        flex
        gap-2
      "
      >
        <button
          onClick={onClose}
          className="
          w-12
          h-12

          rounded-full

          bg-red-600

          text-white
        "
        >
          ✕
        </button>

        <button
          onClick={() => {
            const imageArea = visibleImageRef.current;
          

            onApply({
              x: (cropBox.x - imageArea.x) / imageArea.width,

              y: (cropBox.y - imageArea.y) / imageArea.height,

              width: cropBox.width / imageArea.width,

              height: cropBox.height / imageArea.height,

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
        >
          ✓
        </button>
      </div>
    </div>
  );
}
