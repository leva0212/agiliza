import { Dispatch, SetStateAction } from "react";

import { Point } from "../types/image-viewer.types";
import { ImageViewerState } from "../types/image-viewer.types";

import {
    zoom,
} from "../actions/zoom";

export interface ImageViewerApi {

    transform: ImageViewerState["transform"];

    viewport: ImageViewerState["viewport"];

    fit: ImageViewerState["fit"];

    zoomToPoint(
        point: Point,
        scale: number,
    ): void;

}

export function createImageViewerApi(

    state: ImageViewerState,

    setState: Dispatch<
        SetStateAction<ImageViewerState>
    >,

): ImageViewerApi {

    function zoomToPoint(
        point: Point,
        scale: number,
    ) {

        setState(previous =>
            zoom(
                previous,
                point,
                scale,
            ),
        );

    }

    return {

        transform: state.transform,

        viewport: state.viewport,

        fit: state.fit,

        zoomToPoint,

    };

}