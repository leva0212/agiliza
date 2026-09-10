import { usePointerPan } from "./use-pointer-pan";
import { usePinchZoom } from "./use-pinch-zoom";

interface Options {
  onPan: Parameters<
    typeof usePointerPan
  >[0]["onPan"];

  onZoom: Parameters<
    typeof usePinchZoom
  >[0]["onZoom"];
}

export function usePointerGestures(
  options: Options,
) {
  const pan =
    usePointerPan({
      onPan: options.onPan,
    });

  const pinch =
    usePinchZoom({
      onZoom: options.onZoom,
    });

  return {

    onPointerDown(
      event: React.PointerEvent,
    ) {
      pan.onPointerDown(event);
      pinch.onPointerDown(event);
    },

    onPointerMove(
      event: React.PointerEvent,
    ) {
      pinch.onPointerMove(event);
      pan.onPointerMove(event);
    },

    onPointerUp(event: React.PointerEvent) {
      pan.onPointerUp(event);
      pinch.onPointerUp(event);
    },

    onPointerCancel(event: React.PointerEvent) {
      pan.onPointerCancel(event);
      pinch.onPointerCancel(event);
    }

  };
}