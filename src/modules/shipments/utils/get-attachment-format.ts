export function getAttachmentFormat(
  filename: string,
  mimeType: string | null,
) {
  const normalizedFilename = filename.toLowerCase();
  const normalizedMimeType = mimeType ?? "";
  const extensionMatch = filename.match(/\.([^.]+)$/);
  const extension = extensionMatch ? `.${extensionMatch[1]}` : "Sin extensión";

  if (
    normalizedMimeType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(normalizedFilename)
  ) {
    return { type: "Imagen", extension };
  }

  if (
    normalizedMimeType.startsWith("video/") ||
    /\.(mp4|mpeg|mpg|mov|avi|mkv|webm)$/i.test(normalizedFilename)
  ) {
    return { type: "Video", extension };
  }

  if (
    normalizedMimeType.startsWith("audio/") ||
    /\.(mp3|wav|aac|m4a|ogg|flac)$/i.test(normalizedFilename)
  ) {
    return { type: "Audio", extension };
  }

  if (normalizedMimeType.includes("pdf") || normalizedFilename.endsWith(".pdf")) {
    return { type: "PDF", extension };
  }

  if (
    normalizedMimeType.includes("word") ||
    /\.(doc|docx|docxs|odt)$/i.test(normalizedFilename)
  ) {
    return { type: "Word", extension };
  }

  if (
    normalizedMimeType.includes("spreadsheet") ||
    /\.(xls|xlsx|csv|ods)$/i.test(normalizedFilename)
  ) {
    return { type: "Excel", extension };
  }

  if (
    normalizedMimeType.includes("presentation") ||
    /\.(ppt|pptx|odp)$/i.test(normalizedFilename)
  ) {
    return { type: "PowerPoint", extension };
  }

  if (/\.zip$/i.test(normalizedFilename)) {
    return { type: "ZIP", extension };
  }

  if (/\.rar$/i.test(normalizedFilename)) {
    return { type: "RAR", extension };
  }

  if (/\.7z$/i.test(normalizedFilename)) {
    return { type: "7Z", extension };
  }

  return { type: "Archivo", extension };
}
