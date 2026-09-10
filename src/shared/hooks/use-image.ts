import { useEffect, useState } from "react";

export interface ImageInfo {

    width: number;

    height: number;

    loaded: boolean;

}

export function useImage(
    src: string,
): ImageInfo {

    const [image, setImage] =
        useState<ImageInfo>({
            width: 0,
            height: 0,
            loaded: false,
        });

    useEffect(() => {

        if (!src) {

            setImage({
                width: 0,
                height: 0,
                loaded: false,
            });

            return;

        }

        const img = new Image();

        img.onload = () => {

            setImage({

                width: img.naturalWidth,

                height: img.naturalHeight,

                loaded: true,

            });

        };

        img.src = src;

    }, [src]);

    return image;

}