import { ImageViewerState } from "../types/image-viewer.types";

import {
    syncViewer,
} from "../engine/sync-viewer";

export function reset(
    state: ImageViewerState,
): ImageViewerState {

    return syncViewer(state);

}