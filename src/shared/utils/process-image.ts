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

    const cropX =
        Math.round(
            (options.cropX ?? 0) *
            image.width,
        );

    const cropY =
        Math.round(
            (options.cropY ?? 0) *
            image.height,
        );

    const cropWidth =
        Math.round(
            (options.cropWidth ?? 1) *
            image.width,
        );

    const cropHeight =
        Math.round(
            (options.cropHeight ?? 1) *
            image.height,
        );

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        return file;
    }

    const angle =
        ((options.rotation % 360) + 360) %
        360;

    const rotated =
        angle === 90 ||
        angle === 270;

    canvas.width = rotated
        ? cropHeight
        : cropWidth;

    canvas.height = rotated
        ? cropWidth
        : cropHeight;

    ctx.save();

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2,
    );

    ctx.rotate(
        (angle * Math.PI) / 180,
    );

    ctx.scale(
        options.flipX ? -1 : 1,
        options.flipY ? -1 : 1,
    );

    ctx.drawImage(
        image,

        cropX,
        cropY,

        cropWidth,
        cropHeight,

        -cropWidth / 2,
        -cropHeight / 2,

        cropWidth,
        cropHeight,
    );

    ctx.restore();

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
            type: "image/jpeg",
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