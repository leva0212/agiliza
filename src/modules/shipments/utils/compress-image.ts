type Options = {
  hd?: boolean;
};

export async function compressImage(
  file: File,
  options?: Options,
): Promise<File> {
  const image = await loadImage(file);

  const maxWidth =
    options?.hd
      ? 2400
      : 1600;

  const maxHeight =
    options?.hd
      ? 2400
      : 1600;

  let width = image.width;
  let height = image.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(
      maxWidth / width,
      maxHeight / height,
    );

    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return file;
  }

  ctx.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  const blob = await new Promise<Blob | null>(
    (resolve) => {
      canvas.toBlob(
        resolve,
        "image/jpeg",
        options?.hd
          ? 0.92
          : 0.75,
      );
    },
  );

  if (!blob) {
    return file;
  }

  return new File(
    [blob],
    file.name.replace(
      /\.[^.]+$/,
      ".jpg",
    ),
    {
      type: "image/jpeg",
      lastModified: Date.now(),
    },
  );
}

function loadImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = reject;

      image.src =
        reader.result as string;
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}