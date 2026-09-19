import { useEffect, useState } from "react";

export interface ImageInfo {
  width: number;
  height: number;
  loaded: boolean;
}

const EMPTY_IMAGE: ImageInfo = { width: 0, height: 0, loaded: false };
type LoadedImage = ImageInfo & { src: string };

export function useImage(src: string): ImageInfo {
  const [image, setImage] = useState<LoadedImage | null>(null);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (!cancelled) {
        setImage({
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          loaded: true,
        });
      }
    };
    img.onerror = () => {
      if (!cancelled) setImage(null);
    };
    img.src = src;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      img.src = "";
    };
  }, [src]);

  return image?.src === src ? image : EMPTY_IMAGE;
}