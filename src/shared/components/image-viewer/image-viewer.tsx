"use client";

import { useEffect, useRef, useState } from "react";

import { useImage } from "@/shared/hooks/use-image";
import {
  calculateContainScale,
  calculateCenteredTranslation,
} from "./geometry/fit";
export interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImageViewer({ src, alt, className, style }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const image = useImage(src);

  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const [container, setContainer] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();

      setContainer({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!image.loaded) {
      return;
    }

    if (container.width === 0 || container.height === 0) {
      return;
    }
    console.log("container:", container.width, container.height);

    console.log("image:", image.loaded, image.width, image.height);

    const viewport = {
      viewport: {
        width: container.width,
        height: container.height,
      },
      image: {
        width: image.width,
        height: image.height,
      },
    };

    const scale = calculateContainScale(viewport, true);

    const translation = calculateCenteredTranslation(viewport, scale);

    setTransform({
      scale,
      translateX: translation.x,
      translateY: translation.y,
    });
  }, [
    image.loaded,
    image.width,
    image.height,
    container.width,
    container.height,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        background: "#000",
        ...style,
      }}
    >
      {image.loaded && (
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",

            transform: `
translate(
${transform.translateX}px,
${transform.translateY}px
)
scale(${transform.scale})
`,
          }}
        />
      )}
    </div>
  );
}
