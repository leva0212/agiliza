import { useReducer } from "react";

import { createImageViewerApi } from "../api/image-viewer-api";
import { createImageViewerState } from "../engine/state";
import { imageViewerReducer } from "../engine/image-viewer.reducer";

export function useImageViewer() {

    const [state, dispatch] =
        useReducer(
            imageViewerReducer,
            undefined,
            createImageViewerState,
        );

    return createImageViewerApi(
        state,
        dispatch,
    );

}