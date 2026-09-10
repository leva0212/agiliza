import {
    FitMode,
    ImageViewerState,
} from "../types/image-viewer.types";

import { createTransform } from "../geometry/transform";
import { createViewport } from "../geometry/viewport";

/**
 * Crea el estado inicial del Image Viewer.
 */
export function createImageViewerState(): ImageViewerState {
    return {
        viewport: createViewport(),

        transform: createTransform(),

        fit: {
            mode: "contain" satisfies FitMode,
            allowUpscale: true,
            padding: 0,
        },

        scaleLimits: {
            min: 0.25,
            max: 8,
        },
    };
}

/**
 * Devuelve un nuevo estado con un Transform actualizado.
 */
export function setTransform(
    state: ImageViewerState,
    transform: ImageViewerState["transform"],
): ImageViewerState {
    return {
        ...state,
        transform,
    };
}

/**
 * Devuelve un nuevo estado con un Viewport actualizado.
 */
export function setViewport(
    state: ImageViewerState,
    viewport: ImageViewerState["viewport"],
): ImageViewerState {
    return {
        ...state,
        viewport,
    };
}

/**
 * Actualiza las opciones de Fit.
 */
export function setFit(
    state: ImageViewerState,
    fit: Partial<ImageViewerState["fit"]>,
): ImageViewerState {
    return {
        ...state,
        fit: {
            ...state.fit,
            ...fit,
        },
    };
}

/**
 * Actualiza los límites de escala.
 */
export function setScaleLimits(
    state: ImageViewerState,
    scaleLimits: ImageViewerState["scaleLimits"],
): ImageViewerState {
    return {
        ...state,
        scaleLimits,
    };
}