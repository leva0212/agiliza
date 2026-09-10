import {
    FitMode,
    Point,
    Transform,
    Viewport,
} from "../types/image-viewer.types";

/**
 * Calcula la escala necesaria para que
 * toda la imagen sea visible.
 */
export function calculateContainScale(
    viewport: Viewport,
    allowUpscale = true,
): number {
    const scaleX =
        viewport.viewport.width / viewport.image.width;

    const scaleY =
        viewport.viewport.height / viewport.image.height;

    const scale = Math.min(scaleX, scaleY);

    return allowUpscale ? scale : Math.min(scale, 1);
}

/**
 * Calcula la escala necesaria para cubrir
 * completamente el viewport.
 */
export function calculateCoverScale(
    viewport: Viewport,
    allowUpscale = true,
): number {
    const scaleX =
        viewport.viewport.width / viewport.image.width;

    const scaleY =
        viewport.viewport.height / viewport.image.height;

    const scale = Math.max(scaleX, scaleY);

    return allowUpscale ? scale : Math.min(scale, 1);
}

/**
 * Escala original de la imagen.
 */
export function calculateOriginalScale(): number {
    return 1;
}

/**
 * Calcula la traslación necesaria para centrar
 * la imagen utilizando una escala determinada.
 */
export function calculateCenteredTranslation(
    viewport: Viewport,
    scale: number,
): Point {
    const width = viewport.image.width * scale;

    const height = viewport.image.height * scale;

    return {
        x: (viewport.viewport.width - width) / 2,
        y: (viewport.viewport.height - height) / 2,
    };
}

/**
 * Construye el Transform inicial según el modo
 * de ajuste seleccionado.
 */
export function createFitTransform(
    viewport: Viewport,
    mode: FitMode,
    allowUpscale = true,
): Transform {
    let scale = 1;

    switch (mode) {
        case "contain":
            scale = calculateContainScale(
                viewport,
                allowUpscale,
            );
            break;

        case "cover":
            scale = calculateCoverScale(
                viewport,
                allowUpscale,
            );
            break;

        case "original":
            scale = calculateOriginalScale();
            break;
    }

    const translation =
        calculateCenteredTranslation(
            viewport,
            scale,
        );

    return {
        scale,
        translateX: translation.x,
        translateY: translation.y,
    };
}