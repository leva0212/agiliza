import {
    Delta,
    ImageViewerState,
    Point,
    Size,
} from "../types/image-viewer.types";

import { openImage } from "../actions/open-image";
import { pan } from "../actions/pan";
import { reset } from "../actions/reset";
import { setViewportSizeAction } from "../actions/set-viewport-size";
import { zoom } from "../actions/zoom";

export type ImageViewerAction =
    | {
          type: "open-image";
          imageSize: Size;
      }
    | {
          type: "set-viewport-size";
          size: Size;
      }
    | {
          type: "zoom";
          point: Point;
          factor: number;
      }
    | {
          type: "pan";
          delta: Delta;
      }
    | {
          type: "reset";
      };

export function imageViewerReducer(
    state: ImageViewerState,
    action: ImageViewerAction,
): ImageViewerState {
    switch (action.type) {
        case "open-image":
            return openImage(state, action.imageSize);

        case "set-viewport-size":
            return setViewportSizeAction(state, action.size);

        case "zoom":
            return zoom(
                state,
                action.point,
                action.factor,
            );

        case "pan":
            return pan(
                state,
                action.delta,
            );

        case "reset":
            return reset(state);

        default:
            return state;
    }
}