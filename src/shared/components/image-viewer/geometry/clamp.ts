import {
    Bounds,
    ImageViewerState,
    Transform,
} from "../types/image-viewer.types";

import { createTransformValues } from "./transform";

/**
 * Limita una escala al rango permitido.
 */
export function clampScale(
    state: ImageViewerState,
    scale: number,
): number {
    return Math.min(
        Math.max(scale, state.scaleLimits.min),
        state.scaleLimits.max,
    );
}

/**
 * Calcula los límites válidos de traslación.
 */
export function calculateTranslationBounds(
    state: ImageViewerState,
    scale: number,
): Bounds {

    const scaledWidth =
        state.viewport.image.width * scale;

    const scaledHeight =
        state.viewport.image.height * scale;

    let minX: number;
    let maxX: number;

    if (
        scaledWidth <=
        state.viewport.viewport.width
    ) {
        const center =
            (state.viewport.viewport.width -
                scaledWidth) / 2;

        minX = center;
        maxX = center;
    } else {
        minX =
            state.viewport.viewport.width -
            scaledWidth;

        maxX = 0;
    }

    let minY: number;
    let maxY: number;

    if (
        scaledHeight <=
        state.viewport.viewport.height
    ) {
        const center =
            (state.viewport.viewport.height -
                scaledHeight) / 2;

        minY = center;
        maxY = center;
    } else {
        minY =
            state.viewport.viewport.height -
            scaledHeight;

        maxY = 0;
    }

    return {
        minX,
        maxX,
        minY,
        maxY,
    };
}

/**
 * Limita la traslación utilizando
 * los límites calculados.
 */
export function clampTranslation(
    state: ImageViewerState,
    transform: Transform,
): Transform {

    const bounds =
        calculateTranslationBounds(
            state,
            transform.scale,
        );

    return createTransformValues(
        transform.scale,

        Math.min(
            Math.max(
                transform.translateX,
                bounds.minX,
            ),
            bounds.maxX,
        ),

        Math.min(
            Math.max(
                transform.translateY,
                bounds.minY,
            ),
            bounds.maxY,
        ),
    );
}

/**
 * Aplica todos los límites.
 */
export function clampTransform(
    state: ImageViewerState,
    transform: Transform,
): Transform {

    const scale =
        clampScale(
            state,
            transform.scale,
        );

    return clampTranslation(
        state,

        createTransformValues(
            scale,
            transform.translateX,
            transform.translateY,
        ),
    );
}