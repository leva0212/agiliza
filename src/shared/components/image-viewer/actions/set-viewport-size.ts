import {
    ImageViewerState,
    Size,
} from "../types/image-viewer.types";

import {
    setViewportSize,
} from "../geometry/viewport";

import {
    syncViewer,
} from "../engine/sync-viewer";
export function setViewportSizeAction(
    state: ImageViewerState,
    size: Size,
): ImageViewerState {


    return syncViewer({
        ...state,
        viewport: setViewportSize(
            state.viewport,
            size,
        ),
    });

}
/*
export function setViewportSizeAction(
    state: ImageViewerState,
    size: Size,
): ImageViewerState {

    return syncViewer({
        ...state,
        viewport: setViewportSize(
            state.viewport,
            size,
        ),
    });

}*/