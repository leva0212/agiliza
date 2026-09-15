export function formatFileSize(fileSize: number | null | undefined) {
  if (!Number.isFinite(fileSize) || fileSize === undefined || fileSize === null || fileSize < 0) {
    return "No disponible";
  }

  const sizeInKb = fileSize / 1024;
  if (sizeInKb < 1024) {
    return `${new Intl.NumberFormat("es-CR", {
      maximumFractionDigits: sizeInKb < 10 ? 1 : 0,
    }).format(sizeInKb)} KB`;
  }

  const sizeInMb = sizeInKb / 1024;
  return `${new Intl.NumberFormat("es-CR", {
    maximumFractionDigits: sizeInMb < 10 ? 1 : 0,
  }).format(sizeInMb)} MB`;
}
