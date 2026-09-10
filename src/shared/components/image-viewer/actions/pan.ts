import {
    Delta,
    ImageViewerState,
} from "../types/image-viewer.types";

import {
    clampTransform,
} from "../geometry/clamp";

import {
    translateTransform,
} from "../geometry/transform";

/**
 * Desplaza la imagen.
 */
export function pan(
    state: ImageViewerState,
    delta: Delta,
): ImageViewerState {

    const transform =
        translateTransform(
            state.transform,
            delta,
        );

    return {
        ...state,
        transform: clampTransform(
            state,
            transform,
        ),
    };

}