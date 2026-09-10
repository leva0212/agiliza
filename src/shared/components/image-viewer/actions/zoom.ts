import {
    ImageViewerState,
    Point,
} from "../types/image-viewer.types";

import {
    clampTransform,
} from "../geometry/clamp";

import {
    calculateZoomScale,
    zoomToPoint,
} from "../geometry/zoom";

/**
 * Aplica un factor de zoom
 * alrededor de un punto.
 */
export function zoom(
    state: ImageViewerState,
    point: Point,
    factor: number,
): ImageViewerState {

    const scale =
        calculateZoomScale(
            state.transform.scale,
            factor,
        );

    const next =
        zoomToPoint(
            state,
            point,
            scale,
        );

    return {

        ...next,

        transform:
            clampTransform(
                next,
                next.transform,
            ),

    };

}