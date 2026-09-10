import {
    Size,
    Viewport,
} from "../types/image-viewer.types";

/**
 * Crea un Viewport vacío.
 */
export function createViewport(): Viewport {
    return {
        viewport: {
            width: 0,
            height: 0,
        },
        image: {
            width: 0,
            height: 0,
        },
    };
}

/**
 * Actualiza el tamaño del contenedor.
 */
export function setViewportSize(
    viewport: Viewport,
    size: Size,
): Viewport {
    return {
        ...viewport,
        viewport: size,
    };
}

/**
 * Actualiza el tamaño original de la imagen.
 */
export function setImageSize(
    viewport: Viewport,
    size: Size,
): Viewport {
    return {
        ...viewport,
        image: size,
    };
}

/**
 * Indica si ya existen suficientes datos
 * para realizar cálculos geométricos.
 */
export function isViewportReady(
    viewport: Viewport,
): boolean {
    return (
        viewport.viewport.width > 0 &&
        viewport.viewport.height > 0 &&
        viewport.image.width > 0 &&
        viewport.image.height > 0
    );
}