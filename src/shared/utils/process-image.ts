export type ProcessImageOptions = {
  hd: boolean;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
};

export async function processImage(
  file: File,
  options: ProcessImageOptions,
): Promise<File> {
  const image = await createImageBitmap(file);
  const transformCanvas = document.createElement("canvas");
  const cropCanvas = document.createElement("canvas");
  let resizedCanvas: HTMLCanvasElement | null = null;

  try {
    const angle = ((options.rotation % 360) + 360) % 360;
    const rotated = angle === 90 || angle === 270;
    const transformCtx = transformCanvas.getContext("2d");

    if (!transformCtx) {
      throw new Error("No fue posible preparar la imagen");
    }

    transformCanvas.width = rotated ? image.height : image.width;
    transformCanvas.height = rotated ? image.width : image.height;

    transformCtx.save();
    transformCtx.translate(transformCanvas.width / 2, transformCanvas.height / 2);
    transformCtx.rotate((angle * Math.PI) / 180);
    transformCtx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
    transformCtx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height,
    );
    transformCtx.restore();

    const cropXRatio = Math.min(Math.max(options.cropX ?? 0, 0), 1);
    const cropYRatio = Math.min(Math.max(options.cropY ?? 0, 0), 1);
    const cropWidthRatio = Math.min(
      options.cropWidth && options.cropWidth > 0 ? options.cropWidth : 1,
      1 - cropXRatio,
    );
    const cropHeightRatio = Math.min(
      options.cropHeight && options.cropHeight > 0 ? options.cropHeight : 1,
      1 - cropYRatio,
    );

    const cropX = Math.round(cropXRatio * transformCanvas.width);
    const cropY = Math.round(cropYRatio * transformCanvas.height);
    const cropWidth = Math.max(
      1,
      Math.round(cropWidthRatio * transformCanvas.width),
    );
    const cropHeight = Math.max(
      1,
      Math.round(cropHeightRatio * transformCanvas.height),
    );
    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) {
      throw new Error("No fue posible recortar la imagen");
    }

    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    cropCtx.drawImage(
      transformCanvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    resizedCanvas = resizeCanvas(cropCanvas, options.hd ? 2400 : 1600);
    const blob = await canvasToBlob(resizedCanvas, options.hd ? 0.92 : 0.75);

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    image.close();
    transformCanvas.width = 0;
    transformCanvas.height = 0;
    cropCanvas.width = 0;
    cropCanvas.height = 0;

    if (resizedCanvas && resizedCanvas !== cropCanvas) {
      resizedCanvas.width = 0;
      resizedCanvas.height = 0;
    }
  }
}

function resizeCanvas(source: HTMLCanvasElement, maxSize: number) {
  let width = source.width;
  let height = source.height;

  if (width <= maxSize && height <= maxSize) {
    return source;
  }

  const ratio = Math.min(maxSize / width, maxSize / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    canvas.width = 0;
    canvas.height = 0;
    return source;
  }

  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No fue posible generar imagen"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}