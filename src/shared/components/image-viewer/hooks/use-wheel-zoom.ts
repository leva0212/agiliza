import { RefObject } from "react";

import { Point } from "../types/image-viewer.types";

export interface WheelZoomHandlers {
    onWheel(
        event: React.WheelEvent,
    ): void;
}

interface Options {

    containerRef: RefObject<HTMLElement | null>;

    onZoom(
        point: Point,
        factor: number,
    ): void;

}

const ZOOM_IN_FACTOR = 1.1;

const ZOOM_OUT_FACTOR = 0.9;

export function useWheelZoom(
    options: Options,
): WheelZoomHandlers {

    function onWheel(
        event: React.WheelEvent,
    ) {

        event.preventDefault();

        const element =
            options.containerRef.current;

        if (!element) {
            return;
        }

        const rect =
            element.getBoundingClientRect();

        const point: Point = {

            x: event.clientX - rect.left,

            y: event.clientY - rect.top,

        };

        const factor =
            event.deltaY < 0
                ? ZOOM_IN_FACTOR
                : ZOOM_OUT_FACTOR;

        options.onZoom(
            point,
            factor,
        );

    }

    return {

        onWheel,

    };

}