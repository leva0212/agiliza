import {
    ImageViewerState,
    Size,
} from "../types/image-viewer.types";

import {
    setImageSize,
} from "../geometry/viewport";

import {
    syncViewer,
} from "../engine/sync-viewer";

export function openImage(
    state: ImageViewerState,
    imageSize: Size,
): ImageViewerState {

    return syncViewer({
        ...state,
        viewport: setImageSize(
            state.viewport,
            imageSize,
        ),
    });

}