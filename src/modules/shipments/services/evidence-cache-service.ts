import Dexie, { type Table } from "dexie";

export type CachedEvidence = {
  evidenceId: string;
  shipmentId: string;
  fileUrl: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  downloadedAt: string;
  uploadedByThisDevice: boolean;
};

const MAX_CACHE_ENTRIES = 100;
const MAX_CACHE_BYTES = 150 * 1024 * 1024;

class EvidenceDatabase extends Dexie {
  evidences!: Table<CachedEvidence>;

  constructor() {
    super("syslogistics_evidences");
    this.version(1).stores({
      evidences: "evidenceId, shipmentId, downloadedAt",
    });
  }
}

export const evidenceDb = new EvidenceDatabase();

async function enforceEvidenceCacheBudget() {
  const entries: Array<{ evidenceId: string; size: number }> = [];
  let totalBytes = 0;

  await evidenceDb.evidences.orderBy("downloadedAt").each((row) => {
    const size = row.blob.size + (row.thumbnailBlob?.size ?? 0);
    totalBytes += size;
    entries.push({ evidenceId: row.evidenceId, size });
  });

  const idsToDelete: string[] = [];
  while (
    entries.length - idsToDelete.length > MAX_CACHE_ENTRIES ||
    totalBytes > MAX_CACHE_BYTES
  ) {
    const oldest = entries[idsToDelete.length];
    if (!oldest) break;
    idsToDelete.push(oldest.evidenceId);
    totalBytes -= oldest.size;
  }

  if (idsToDelete.length > 0) {
    await evidenceDb.evidences.bulkDelete(idsToDelete);
  }
}

export async function getCachedEvidence(evidenceId: string) {
  return evidenceDb.evidences.get(evidenceId);
}

export async function saveCachedEvidence(
  evidenceId: string,
  shipmentId: string,
  fileUrl: string,
  blob: Blob,
  uploadedByThisDevice = false,
) {
  await evidenceDb.evidences.put({
    evidenceId,
    shipmentId,
    fileUrl,
    blob,
    downloadedAt: new Date().toISOString(),
    uploadedByThisDevice,
  });
  await enforceEvidenceCacheBudget();
}

export async function deleteCachedEvidence(evidenceId: string) {
  await evidenceDb.evidences.delete(evidenceId);
}

export async function getEvidenceBlobUrl(evidenceId: string) {
  const cached = await getCachedEvidence(evidenceId);
  return cached ? URL.createObjectURL(cached.blob) : null;
}

export async function cacheEvidenceFile(
  evidenceId: string,
  shipmentId: string,
  fileUrl: string,
  file: File,
  thumbnailFile?: File,
) {
  await evidenceDb.evidences.put({
    evidenceId,
    shipmentId,
    fileUrl,
    blob: file,
    thumbnailBlob: thumbnailFile,
    downloadedAt: new Date().toISOString(),
    uploadedByThisDevice: true,
  });
  await enforceEvidenceCacheBudget();
}

export async function getEvidenceImageUrl(
  evidenceId: string,
  shipmentId: string,
  fileUrl: string,
) {
  const cached = await getCachedEvidence(evidenceId);
  if (cached) return URL.createObjectURL(cached.blob);

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    await saveCachedEvidence(evidenceId, shipmentId, fileUrl, blob);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("[EvidenceCache] No fue posible almacenar la evidencia:", error);
    return fileUrl;
  }
}

export async function preloadShipmentEvidences(
  evidences: Array<{ id: string; shipment_id: string; file_url: string | null }>,
) {
  for (const evidence of evidences) {
    if (!evidence.file_url || (await getCachedEvidence(evidence.id))) continue;

    try {
      const response = await fetch(evidence.file_url);
      if (!response.ok) continue;
      const blob = await response.blob();
      await saveCachedEvidence(
        evidence.id,
        evidence.shipment_id,
        evidence.file_url,
        blob,
      );
    } catch (error) {
      console.error("[EvidenceCache] Error de precarga:", error);
    }
  }
}

export async function getShipmentCachedCount(shipmentId: string) {
  return evidenceDb.evidences.where("shipmentId").equals(shipmentId).count();
}

export async function getEvidenceCacheInfo(evidenceId: string) {
  const cached = await getCachedEvidence(evidenceId);
  if (!cached) {
    return { cached: false, uploadedByThisDevice: false, downloadedAt: null };
  }

  return {
    cached: true,
    uploadedByThisDevice: cached.uploadedByThisDevice,
    downloadedAt: cached.downloadedAt,
  };
}

export async function getEvidenceThumbnailUrl(evidenceId: string) {
  const cached = await getCachedEvidence(evidenceId);
  if (!cached) return null;
  return URL.createObjectURL(cached.thumbnailBlob ?? cached.blob);
}