import { useRef } from "react";

import { Point } from "../types/image-viewer.types";

export interface PinchZoomHandlers {
  onPointerDown(event: React.PointerEvent): void;
  onPointerMove(event: React.PointerEvent): void;
  onPointerUp(event: React.PointerEvent): void;
  onPointerCancel(event: React.PointerEvent): void;
}

interface Options {
  onZoom(
    center: Point,
    factor: number,
  ): void;
}

export function usePinchZoom(
  options: Options,
): PinchZoomHandlers {
  const pointers = useRef(
    new Map<number, Point>(),
  );

  const previousDistance =
    useRef<number | null>(null);

  function updatePointer(
    event: React.PointerEvent,
  ) {
    pointers.current.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY,
      },
    );
  }

  function removePointer(
    event: React.PointerEvent,
  ) {
    pointers.current.delete(
      event.pointerId,
    );

    previousDistance.current = null;
  }

  function onPointerDown(
    event: React.PointerEvent,
  ) {
    updatePointer(event);
  }

  function onPointerMove(
    event: React.PointerEvent,
  ) {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }

    updatePointer(event);

    if (pointers.current.size !== 2) {
      return;
    }

    const [a, b] = [
      ...pointers.current.values(),
    ];

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const distance =
      Math.hypot(dx, dy);

    if (
      previousDistance.current !== null
    ) {
      const factor =
        distance /
        previousDistance.current;

      options.onZoom(
        {
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2,
        },
        factor,
      );
    }

    previousDistance.current =
      distance;
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: removePointer,
    onPointerCancel: removePointer,
  };
}