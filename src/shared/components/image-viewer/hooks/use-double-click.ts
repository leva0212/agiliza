import { RefObject } from "react";

import { Point } from "../types/image-viewer.types";

export interface DoubleClickHandlers {
  onDoubleClick(
    event: React.MouseEvent,
  ): void;
}

interface Options {
  containerRef: RefObject<HTMLElement | null>;

  onDoubleClick(
    point: Point,
  ): void;
}

export function useDoubleClick(
  options: Options,
): DoubleClickHandlers {
  function onDoubleClick(
    event: React.MouseEvent,
  ) {
    event.preventDefault();

    const element =
      options.containerRef.current;

    if (!element) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    options.onDoubleClick({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  return {
    onDoubleClick,
  };
}