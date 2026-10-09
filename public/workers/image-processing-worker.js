self.onmessage = async ({ data }) => {
  const { id, request } = data;
  let bitmap;
  let thumbnailCanvas;
  let transformedCanvas;
  let outputCanvas;

  try {
    bitmap = await createImageBitmap(request.file);
    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;

    if (request.kind === "thumbnail") {
      thumbnailCanvas = new OffscreenCanvas(request.size, request.size);
      const context = thumbnailCanvas.getContext("2d");
      if (!context) throw new Error("No se pudo crear canvas");
      const scale = Math.max(request.size / bitmap.width, request.size / bitmap.height);
      const width = bitmap.width * scale;
      const height = bitmap.height * scale;
      context.drawImage(bitmap, (request.size - width) / 2, (request.size - height) / 2, width, height);
      const blob = await thumbnailCanvas.convertToBlob({ type: "image/jpeg", quality: request.quality });
      self.postMessage({ id, ok: true, blob, originalWidth, originalHeight,
        outputWidth: request.size, outputHeight: request.size, preserved: false });
      return;
    }

    const angle = ((request.rotation % 360) + 360) % 360;
    const rotated = angle === 90 || angle === 270;
    const hasCrop = (request.cropX ?? 0) !== 0 || (request.cropY ?? 0) !== 0 ||
      (request.cropWidth ?? 0) !== 0 || (request.cropHeight ?? 0) !== 0;
    const header = new Uint8Array(await request.file.slice(0, 3).arrayBuffer());
    const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;

    if (request.preserveSmallJpeg && angle === 0 && !request.flipX && !request.flipY && !hasCrop &&
      isJpeg && request.file.size <= 1024 * 1024 &&
      bitmap.width <= request.maxSize && bitmap.height <= request.maxSize) {
      self.postMessage({ id, ok: true, blob: request.file, originalWidth, originalHeight,
        outputWidth: bitmap.width, outputHeight: bitmap.height, preserved: true });
      return;
    }

    const transformedWidth = rotated ? bitmap.height : bitmap.width;
    const transformedHeight = rotated ? bitmap.width : bitmap.height;
    let drawable = bitmap;

    // Most barcode jobs have no geometric edits. Drawing the bitmap directly
    // avoids allocating another full-resolution RGBA surface (often 40-80 MB).
    if (angle !== 0 || request.flipX || request.flipY) {
      transformedCanvas = new OffscreenCanvas(transformedWidth, transformedHeight);
      const transformedContext = transformedCanvas.getContext("2d");
      if (!transformedContext) throw new Error("No fue posible preparar la imagen");
      transformedContext.translate(transformedWidth / 2, transformedHeight / 2);
      transformedContext.rotate((angle * Math.PI) / 180);
      transformedContext.scale(request.flipX ? -1 : 1, request.flipY ? -1 : 1);
      transformedContext.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
      drawable = transformedCanvas;
    }

    const cropXRatio = Math.min(Math.max(request.cropX ?? 0, 0), 1);
    const cropYRatio = Math.min(Math.max(request.cropY ?? 0, 0), 1);
    const cropWidthRatio = Math.min(request.cropWidth && request.cropWidth > 0 ? request.cropWidth : 1, 1 - cropXRatio);
    const cropHeightRatio = Math.min(request.cropHeight && request.cropHeight > 0 ? request.cropHeight : 1, 1 - cropYRatio);
    const sourceX = Math.round(cropXRatio * transformedWidth);
    const sourceY = Math.round(cropYRatio * transformedHeight);
    const sourceWidth = Math.max(1, Math.round(cropWidthRatio * transformedWidth));
    const sourceHeight = Math.max(1, Math.round(cropHeightRatio * transformedHeight));
    const ratio = Math.min(1, request.maxSize / Math.max(sourceWidth, sourceHeight));
    const outputWidth = Math.max(1, Math.round(sourceWidth * ratio));
    const outputHeight = Math.max(1, Math.round(sourceHeight * ratio));
    outputCanvas = new OffscreenCanvas(outputWidth, outputHeight);
    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) throw new Error("No fue posible redimensionar la imagen");
    outputContext.fillStyle = "white";
    outputContext.fillRect(0, 0, outputWidth, outputHeight);
    outputContext.drawImage(drawable, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
    const blob = await outputCanvas.convertToBlob({ type: "image/jpeg", quality: request.quality });
    self.postMessage({ id, ok: true, blob, originalWidth, originalHeight,
      outputWidth, outputHeight, preserved: false });
  } catch (error) {
    self.postMessage({ id, ok: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    bitmap?.close();
    if (thumbnailCanvas) {
      thumbnailCanvas.width = 1;
      thumbnailCanvas.height = 1;
    }
    if (transformedCanvas) {
      transformedCanvas.width = 1;
      transformedCanvas.height = 1;
    }
    if (outputCanvas) {
      outputCanvas.width = 1;
      outputCanvas.height = 1;
    }
  }
};
