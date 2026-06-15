import type { ShipmentEvidence }
  from "../types/shipment-evidence";

import {
  getCachedEvidence,
} from "./evidence-cache-service";

type Input = {
  trackingNumber: string;

  evidences: ShipmentEvidence[];
};
declare global {
  interface Window {
    showDirectoryPicker(): Promise<any>;
  }
}

export async function saveEvidencesToFolder({
  trackingNumber,
  evidences,
}: Input) {
    
  const directoryHandle =
    await window.showDirectoryPicker();

  const comments: string[] = [];

  let index = 1;

  for (const evidence of evidences) {
    const cached =
      await getCachedEvidence(
        evidence.id,
      );

    if (!cached) {
      continue;
    }

    const extension =
      getExtension(
        evidence.mime_type,
      );

    const fileName =
      `${trackingNumber}-Evidencia-${String(index).padStart(2, "0")}.${extension}`;

    const fileHandle =
      await directoryHandle.getFileHandle(
        fileName,
        {
          create: true,
        },
      );

    const writable =
      await fileHandle.createWritable();

    await writable.write(
      cached.blob,
    );

    await writable.close();

    comments.push(
      [
        "--------------------------------",
        `EVIDENCIA ${index}`,
        "",
        evidence.notes ??
          "Sin comentarios",
        "",
      ].join("\n"),
    );

    index++;
  }

  const commentsHandle =
    await directoryHandle.getFileHandle(
      `${trackingNumber}-Comentarios.txt`,
      {
        create: true,
      },
    );

  const commentsWritable =
    await commentsHandle.createWritable();

  await commentsWritable.write(
    comments.join("\n"),
  );

  await commentsWritable.close();
}

function getExtension(
  mimeType: string | null,
) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}