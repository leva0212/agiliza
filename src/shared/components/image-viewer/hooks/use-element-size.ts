import {
    RefObject,
    useEffect,
    useState,
} from "react";

import { Size } from "../types/image-viewer.types";

const EMPTY_SIZE: Size = {
    width: 0,
    height: 0,
};

export function useElementSize<T extends HTMLElement>(
    ref: RefObject<T | null>,
): Size {

    const [size, setSize] =
        useState<Size>(EMPTY_SIZE);

    useEffect(() => {

        const element = ref.current;

        if (!element) {
            return;
        }

        const observer =
            new ResizeObserver(() => {

                const rect =
                    element.getBoundingClientRect();

                setSize(previous => {

                    if (
                        previous.width === rect.width &&
                        previous.height === rect.height
                    ) {
                        return previous;
                    }

                    return {
                        width: rect.width,
                        height: rect.height,
                    };

                });

            });

        observer.observe(element);

        return () => observer.disconnect();

    }, [ref]);

    return size;

}