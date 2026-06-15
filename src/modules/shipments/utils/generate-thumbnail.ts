export async function generateThumbnail(
  file: File,
): Promise<File> {
  const image =
    await createImageBitmap(file);

  const canvas =
    document.createElement("canvas");

  const size = 300;

  canvas.width = size;
  canvas.height = size;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "No se pudo crear canvas",
    );
  }

  const scale =
    Math.max(
      size / image.width,
      size / image.height,
    );

  const width =
    image.width * scale;

  const height =
    image.height * scale;

  const x =
    (size - width) / 2;

  const y =
    (size - height) / 2;

  ctx.drawImage(
    image,
    x,
    y,
    width,
    height,
  );

  const blob =
    await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(
                new Error(
                  "No se pudo generar thumbnail",
                ),
              );

              return;
            }

            resolve(result);
          },
          "image/jpeg",
          0.8,
        );
      },
    );

  return new File(
    [blob],
    file.name,
    {
      type: "image/jpeg",
    },
  );
}