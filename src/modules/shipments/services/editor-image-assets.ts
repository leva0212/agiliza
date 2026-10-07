import type { PendingEvidence } from "../types/pending-evidence";
import { evidenceDb } from "./evidence-cache-service";
import { getPendingEvidenceFile } from "./pending-evidence-storage";
import { processImage } from "@/shared/utils/process-image";
import { generateThumbnail } from "../utils/generate-thumbnail";

type EditableImage = Pick<
  PendingEvidence,
  | "id"
  | "hd"
  | "rotation"
  | "flipX"
  | "flipY"
  | "cropX"
  | "cropY"
  | "cropWidth"
  | "cropHeight"
>;

export function editorAssetKey(item: EditableImage, thumbnail = false) {
  const options = {
    hd: item.hd,
    rotation: item.rotation,
    flipX: item.flipX,
    flipY: item.flipY,
    cropX: item.cropX,
    cropY: item.cropY,
    cropWidth: item.cropWidth,
    cropHeight: item.cropHeight,
  };
  return `${item.id}:${thumbnail ? "thumb" : "preview"}-v2:${JSON.stringify(options)}`;
}

export async function originalFor(item: Pick<PendingEvidence, "id" | "storedLocally" | "originalFile">) {
  if (!item.storedLocally) return item.originalFile;
  const file = await getPendingEvidenceFile(item.id);
  if (!file) throw new Error("No se encontró la imagen guardada en este dispositivo");
  return file;
}

export async function editorAsset(item: PendingEvidence, thumbnail = false): Promise<File> {
  const options = { hd: item.hd, rotation: item.rotation, flipX: item.flipX, flipY: item.flipY,
    cropX: item.cropX, cropY: item.cropY, cropWidth: item.cropWidth, cropHeight: item.cropHeight };
  const key = editorAssetKey(item, thumbnail);
  const cached = await evidenceDb.imageAssets.get(key);
  if (cached) return new File([cached.blob], "image.jpg", { type: "image/jpeg" });
  const source = await originalFor(item);
  const file = thumbnail ? await generateThumbnail(source, 160) : await processImage(source, options);
  await evidenceDb.imageAssets.put({ key, ownerId: item.id, blob: file });
  return file;
}
