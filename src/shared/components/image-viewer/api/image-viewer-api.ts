import { Delta } from "../types/image-viewer.types";
import { Dispatch } from "react";
import {
    ImageViewerState,
    Point,
    Size,
} from "../types/image-viewer.types";

import {
    ImageViewerAction,
} from "../engine/image-viewer.reducer";

export interface ImageViewerApi {

    readonly transform: ImageViewerState["transform"];

    readonly viewport: ImageViewerState["viewport"];

    readonly fit: ImageViewerState["fit"];

    openImage(
        imageSize: Size,
    ): void;

    setViewportSize(
        size: Size,
    ): void;

    reset(): void;

    zoomToPoint(
        point: Point,
        factor: number,
    ): void;

    pan(
        delta: Delta,
    ): void;
    zoomIn(
  point: Point,
): void;

zoomOut(
  point: Point,
): void;

}

export function createImageViewerApi(
    state: ImageViewerState,
    dispatch: Dispatch<ImageViewerAction>,
): ImageViewerApi {

    return {


        transform: state.transform,

        viewport: state.viewport,

        fit: state.fit,

        zoomIn(point) {
  dispatch({
    type: "zoom",
    point,
    factor: 2,
  });
},

zoomOut(point) {
  dispatch({
    type: "zoom",
    point,
    factor: 0.5,
  });
},

        openImage(
            imageSize,
        ) {

            dispatch({
                type: "open-image",
                imageSize,
            });

        },
        setViewportSize(size) {

    dispatch({
        type: "set-viewport-size",
        size,
    });
},

        /*setViewportSize(
            size,
        ) {

            dispatch({
                type: "set-viewport-size",
                size,
            });

        },*/

        reset() {

            dispatch({
                type: "reset",
            });

        },

        zoomToPoint(
            point,
            factor,
        ) {

            dispatch({
                type: "zoom",
                point,
                factor,
            });

        },

        pan(
            delta,
        ) {

            dispatch({
                type: "pan",
                delta,
            });

        },



    };

}