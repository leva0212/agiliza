import { useRef } from "react";

import { Delta, Point } from "../types/image-viewer.types";

export interface PointerPanHandlers {
    onPointerDown(event: React.PointerEvent): void;
    onPointerMove(event: React.PointerEvent): void;
    onPointerUp(event: React.PointerEvent): void;
    onPointerCancel(event: React.PointerEvent): void;
}

interface Options {
    onPan(delta: Delta): void;
}

export function usePointerPan(
    options: Options,
): PointerPanHandlers {
    const dragging = useRef(false);

    const last = useRef<Point>({
        x: 0,
        y: 0,
    });

    function onPointerDown(
        event: React.PointerEvent,
    ) {
        if (event.button !== 0) {
            return;
        }

        dragging.current = true;

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );

        last.current = {
            x: event.clientX,
            y: event.clientY,
        };
    }

    function onPointerMove(
        event: React.PointerEvent,
    ) {
        if (!dragging.current) {
            return;
        }

        const delta: Delta = {
            x: event.clientX - last.current.x,
            y: event.clientY - last.current.y,
        };

        last.current = {
            x: event.clientX,
            y: event.clientY,
        };

        if (delta.x !== 0 || delta.y !== 0) {
            options.onPan(delta);
        }
    }

    function stopDragging(
        event: React.PointerEvent,
    ) {
        dragging.current = false;

        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId,
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId,
            );
        }
    }

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp: stopDragging,
        onPointerCancel: stopDragging,
    };
}