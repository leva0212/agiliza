import { ImageViewerState } from "../types/image-viewer.types";

import { createFitTransform } from "../geometry/fit";

/**
 * Calcula el Transform correspondiente
 * al modo de ajuste configurado.
 */
export function fit(
    state: ImageViewerState,
): ImageViewerState {

    const transform =
        createFitTransform(
            state.viewport,
            state.fit.mode,
            state.fit.allowUpscale,
        );

    return {
        ...state,
        transform,
    };
}