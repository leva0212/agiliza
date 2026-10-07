import { evidenceDb } from "./evidence-cache-service";

/**
 * Stores the original image selected by the user in IndexedDB.
 *
 * The original is kept untouched so crop/rotate/flip can always work
 * from the source image without accumulating quality loss.
 */
export async function savePendingEvidenceFile(
  id: string,
  shipmentId: string,
  file: File,
) {
  await evidenceDb.pendingEvidences.put({
    id,
    shipmentId,
    blob: file,
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
    lastModified: file.lastModified,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Returns the original pending image as a File.
 *
 * Reading from IndexedDB is local; this does not download anything
 * from Supabase or the network.
 */
export async function getPendingEvidenceFile(
  id: string,
): Promise<File | null> {
  const record = await evidenceDb.pendingEvidences.get(id);

  if (!record) return null;

  return new File(
    [record.blob],
    record.fileName,
    {
      type: record.mimeType || record.blob.type || "image/jpeg",
      lastModified: record.lastModified,
    },
  );
}

export async function hasPendingEvidenceFile(
  id: string,
): Promise<boolean> {
  return (await evidenceDb.pendingEvidences.get(id)) !== undefined;
}

export async function deletePendingEvidenceFile(
  id: string,
) {
  await evidenceDb.pendingEvidences.delete(id);
}

export async function deletePendingEvidenceFiles(
  ids: string[],
) {
  if (ids.length === 0) return;

  await evidenceDb.pendingEvidences.bulkDelete(ids);
}

/**
 * Removes all pending originals associated with one shipment.
 *
 * IMPORTANT:
 * Do not call this from a normal component unmount because an unmount
 * can happen during navigation/re-render. Use it only when the pending
 * session is intentionally discarded or has been completed.
 */
export async function clearPendingEvidenceFilesForShipment(
  shipmentId: string,
) {
  await evidenceDb.pendingEvidences
    .where("shipmentId")
    .equals(shipmentId)
    .delete();
}

export async function getPendingEvidenceCount(
  shipmentId: string,
) {
  return evidenceDb.pendingEvidences
    .where("shipmentId")
    .equals(shipmentId)
    .count();
}