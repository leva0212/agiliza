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
    const image =
        await loadImage(file);

    const angle =
        ((options.rotation % 360) + 360) %
        360;

    
    const rotated =
        angle === 90 ||
        angle === 270;

    // =====================================
    // Canvas 1
    // Imagen transformada
    // =====================================

    const transformCanvas =
        document.createElement(
            "canvas",
        );

    const transformCtx =
        transformCanvas.getContext(
            "2d",
        );

    if (!transformCtx) {
        return file;
    }

    transformCanvas.width =
        rotated
            ? image.height
            : image.width;

    transformCanvas.height =
        rotated
            ? image.width
            : image.height;

    transformCtx.save();

    transformCtx.translate(
        transformCanvas.width / 2,
        transformCanvas.height / 2,
    );

    transformCtx.rotate(
        (angle * Math.PI) / 180,
    );

    transformCtx.scale(
        options.flipX
            ? -1
            : 1,
        options.flipY
            ? -1
            : 1,
    );

    transformCtx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height,
    );

    transformCtx.restore();

    // =====================================
    // Crop sobre imagen ya transformada
    // =====================================

    const cropXRatio = Math.min(
        Math.max(options.cropX ?? 0, 0),
        1,
    );

    const cropYRatio = Math.min(
        Math.max(options.cropY ?? 0, 0),
        1,
    );

    // Las evidencias sin recorte se inicializan con 0. En ese caso,
    // se debe conservar la imagen completa y no crear un canvas 0 × 0.
    const cropWidthRatio = Math.min(
        options.cropWidth && options.cropWidth > 0
            ? options.cropWidth
            : 1,
        1 - cropXRatio,
    );

    const cropHeightRatio = Math.min(
        options.cropHeight && options.cropHeight > 0
            ? options.cropHeight
            : 1,
        1 - cropYRatio,
    );

    const cropX = Math.round(
        cropXRatio * transformCanvas.width,
    );

    const cropY = Math.round(
        cropYRatio * transformCanvas.height,
    );

    const cropWidth = Math.max(
        1,
        Math.round(cropWidthRatio * transformCanvas.width),
    );

    const cropHeight = Math.max(
        1,
        Math.round(cropHeightRatio * transformCanvas.height),
    );

   

    // =====================================
    // Canvas 2
    // Resultado crop
    // =====================================

    const canvas =
        document.createElement(
            "canvas",
        );

    const ctx =
        canvas.getContext(
            "2d",
        );

    if (!ctx) {
        return file;
    }

    canvas.width =
        cropWidth;

    canvas.height =
        cropHeight;

    ctx.drawImage(
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

    const resized =
        resizeCanvas(
            canvas,
            options.hd
                ? 2400
                : 1600,
        );

    const blob =
        await canvasToBlob(
            resized,
            options.hd
                ? 0.92
                : 0.75,
        );

    return new File(
        [blob],
        file.name.replace(
            /\.[^.]+$/,
            ".jpg",
        ),
        {
            type:
                "image/jpeg",

            lastModified:
                Date.now(),
        },
    );
}
function resizeCanvas(
    source: HTMLCanvasElement,
    maxSize: number,
) {
    let width = source.width;

    let height = source.height;

    if (
        width <= maxSize &&
        height <= maxSize
    ) {
        return source;
    }

    const ratio = Math.min(
        maxSize / width,
        maxSize / height,
    );

    width =
        Math.round(width * ratio);

    height =
        Math.round(height * ratio);

    const canvas =
        document.createElement("canvas");

    canvas.width = width;

    canvas.height = height;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        return source;
    }


    ctx.drawImage(
        source,
        0,
        0,
        width,
        height,
    );

    return canvas;
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    quality: number,
): Promise<Blob> {
    return new Promise(
        (resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(
                            new Error(
                                "No fue posible generar imagen",
                            ),
                        );

                        return;
                    }

                    resolve(blob);
                },
                "image/jpeg",
                quality,
            );
        },
    );
}

function loadImage(
    file: File,
): Promise<HTMLImageElement> {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload = () => {
                const image =
                    new Image();

                image.onload = () =>
                    resolve(image);

                image.onerror =
                    reject;

                image.src =
                    reader.result as string;
            };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file,
            );
        },
    );
}
