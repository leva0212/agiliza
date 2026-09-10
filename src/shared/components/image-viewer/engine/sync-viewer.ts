import { ImageViewerState } from "../types/image-viewer.types";

import { fit } from "../actions/fit";

/**
 * Mantiene consistente el estado del visor.
 *
 * Siempre que cambie información estructural
 * (viewport, imagen, fit, etc.) recalcula el
 * Transform correspondiente.
 */
export function syncViewer(
    state: ImageViewerState,
): ImageViewerState {

    return fit(state);

}