import { createTransformValues } from "./transform";
import {
    ImageViewerState,
    Point,
} from "../types/image-viewer.types";

import { screenToImage } from "./coordinates";

/**
 * Realiza zoom manteniendo fijo
 * el punto indicado en pantalla.
 */
export function zoomToPoint(
    state: ImageViewerState,
    screenPoint: Point,
    targetScale: number,
): ImageViewerState {

    const imagePoint = screenToImage(
        screenPoint,
        state.transform,
    );

    const nextTransform = createTransformValues(
    targetScale,
    screenPoint.x -
        imagePoint.x * targetScale,
    screenPoint.y -
        imagePoint.y * targetScale,
);

    return {
        ...state,
        transform: nextTransform,
    };
}

/**
 * Calcula una nueva escala
 * aplicando un factor multiplicativo.
 */
export function calculateZoomScale(
    currentScale: number,
    factor: number,
): number {

    return currentScale * factor;

}