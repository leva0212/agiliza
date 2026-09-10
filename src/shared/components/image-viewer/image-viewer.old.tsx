"use client";

import { CSSProperties, useEffect, useRef } from "react";
import { useDoubleClick } from "./hooks/use-double-click";
import { useImage } from "@/shared/hooks/use-image";

import { useElementSize } from "./hooks/use-element-size";
import { useImageViewer } from "./hooks/use-image-viewer";
import { usePointerGestures } from "./hooks/use-pointer-gestures";

import { FitMode } from "./types/image-viewer.types";
import { useWheelZoom } from "./hooks/use-wheel-zoom";

export interface ImageViewerProps {
  src: string;
  alt?: string;
  fit?: FitMode;
  className?: string;
  style?: CSSProperties;
}

export function ImageViewer({ src, alt, className, style }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const viewer = useImageViewer();
  const gestures = usePointerGestures({
    onPan(delta) {
      viewer.pan(delta);
    },

    onZoom(point, factor) {
      viewer.zoomToPoint(point, factor);
    },
  });

  const wheel = useWheelZoom({
    containerRef,

    onZoom(point, factor) {
      viewer.zoomToPoint(point, factor);
    },
  });

  const doubleClick = useDoubleClick({
    containerRef,
    onDoubleClick(point) {
      if (viewer.transform.scale > 1.5) {
        viewer.reset();
      } else {
        viewer.zoomIn(point);
      }
    },
  });

  const image = useImage(src);

  const viewport = useElementSize(containerRef);

  useEffect(() => {
    viewer.setViewportSize(viewport);
  }, [viewport.width, viewport.height]);

  useEffect(() => {
    if (!image.loaded) {
      return;
    }

    viewer.openImage({
      width: image.width,
      height: image.height,
    });
  }, [viewer, image.loaded, image.width, image.height]);

  return (
    <div
      ref={containerRef}
      className={className}
      onWheel={wheel.onWheel}
      onPointerDown={gestures.onPointerDown}
      onPointerMove={gestures.onPointerMove}
      onPointerUp={gestures.onPointerUp}
      onPointerCancel={gestures.onPointerCancel}
      onDoubleClick={() => {
        console.log("DIV DOUBLE CLICK");
      }}
      //onDoubleClick={doubleClick.onDoubleClick}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        touchAction: "none",
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${viewer.transform.translateX}px, ${viewer.transform.translateY}px) scale(${viewer.transform.scale})`,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
