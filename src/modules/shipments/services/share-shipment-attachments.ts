import type { ShipmentAttachment } from "../types/shipment-attachment";

const MAX_TOTAL_SHARE_SIZE = 50 * 1024 * 1024;

type Input = {
  trackingNumber: string;
  attachments: ShipmentAttachment[];
  includeComments?: boolean;
};

export async function shareShipmentAttachments({
  trackingNumber,
  attachments,
  includeComments = true,
}: Input) {
  if (typeof navigator.share !== "function") {
    throw new Error("La función Compartir no está disponible. Use Chrome Android o abra la aplicación mediante HTTPS.");
  }

  const estimatedSize = attachments.reduce(
    (total, attachment) => total + (
      attachment.storage_provider === "cloudinary"
        ? attachment.optimized_file_size ?? attachment.file_size ?? 0
        : attachment.file_size ?? 0
    ),
    0,
  );

  if (estimatedSize > MAX_TOTAL_SHARE_SIZE) {
    throw new Error("Los adjuntos superan 50 MB. Para proteger la memoria del teléfono, compártalos en grupos más pequeños.");
  }

  const files = await Promise.all(attachments.map(async (attachment) => {
    const response = await fetch(attachment.file_url);
    if (!response.ok) {
      throw new Error(`No fue posible preparar ${attachment.original_filename} para compartir.`);
    }

    const file = new File(
      [await response.blob()],
      attachment.original_filename,
      { type: attachment.mime_type ?? "application/octet-stream" },
    );

    return file;
  }));

  if (typeof navigator.canShare === "function" && !navigator.canShare({ files })) {
    throw new Error("Este navegador no permite compartir los formatos de archivo seleccionados.");
  }

  const comments = attachments
    .filter((attachment) => attachment.notes.trim())
    .map((attachment) => `📎 ${attachment.original_filename}\n${attachment.notes.trim()}`);

  await navigator.share({
    title: `Adjuntos ${trackingNumber}`,
    text: includeComments && comments.length > 0
      ? [`ADJUNTOS ${trackingNumber}`, "", ...comments].join("\n\n")
      : undefined,
    files,
  });
}
