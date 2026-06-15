import Dexie, { Table } from "dexie";
import { createClient } from "@/lib/supabase/client";

export type CachedEvidence = {
    evidenceId: string;

    shipmentId: string;

    fileUrl: string;

    blob: Blob;

    thumbnailBlob?: Blob;

    downloadedAt: string;

    uploadedByThisDevice: boolean;
};

class EvidenceDatabase extends Dexie {
    evidences!: Table<CachedEvidence>;

    constructor() {
        super("syslogistics_evidences");

        this.version(1).stores({
            evidences:
                "evidenceId, shipmentId, downloadedAt",
        });
    }
}

export const evidenceDb =
    new EvidenceDatabase();

export async function getCachedEvidence(
    evidenceId: string,
) {
    return evidenceDb.evidences.get(
        evidenceId,
    );
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

        downloadedAt:
            new Date().toISOString(),
        uploadedByThisDevice,

    });
}


export async function deleteCachedEvidence(
    evidenceId: string,
) {
    await evidenceDb.evidences.delete(
        evidenceId,
    );
}


export async function getEvidenceBlobUrl(
    evidenceId: string,
) {
    const cached =
        await getCachedEvidence(
            evidenceId,
        );

    if (!cached) {
        return null;
    }

    return URL.createObjectURL(
        cached.blob,
    );
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

        thumbnailBlob:
            thumbnailFile,

        downloadedAt:
            new Date().toISOString(),

        uploadedByThisDevice:
            true,
    });
}

export async function getEvidenceImageUrl(
    evidenceId: string,
    shipmentId: string,
    fileUrl: string,
) {
    const cached =
        await getCachedEvidence(
            evidenceId,
        );

    if (cached) {
        console.log(
            "[EvidenceCache] Cache hit:",
            evidenceId,
        );

        return URL.createObjectURL(
            cached.blob,
        );
    }

    console.log(
        "[EvidenceCache] Cache miss:",
        evidenceId,
    );

    try {
        const response =
            await fetch(fileUrl);

        const blob =
            await response.blob();

        await saveCachedEvidence(
            evidenceId,
            shipmentId,
            fileUrl,
            blob,
        );

        return URL.createObjectURL(
            blob,
        );
    } catch (error) {
        console.error(
            "[EvidenceCache] Download error:",
            error,
        );

        return fileUrl;
    }
}



export async function preloadShipmentEvidences(
    evidences: {
        id: string;
        shipment_id: string;
        file_url: string | null;
    }[],
) {
    for (const evidence of evidences) {
        if (!evidence.file_url) {
            continue;
        }

        const cached =
            await getCachedEvidence(
                evidence.id,
            );

        if (cached) {
            continue;
        }

        try {
            const response =
                await fetch(
                    evidence.file_url,
                );

            const blob =
                await response.blob();

            await saveCachedEvidence(
                evidence.id,
                evidence.shipment_id,
                evidence.file_url,
                blob,
            );

            console.log(
                "[EvidenceCache] Downloaded:",
                evidence.id,
            );
        } catch (error) {
            console.error(error);
        }
    }
}


export async function getShipmentCachedCount(
    shipmentId: string,
) {
    const rows =
        await evidenceDb.evidences
            .where("shipmentId")
            .equals(shipmentId)
            .toArray();

    return rows.length;
}

export async function getEvidenceCacheInfo(
    evidenceId: string,
) {
    const cached =
        await getCachedEvidence(
            evidenceId,
        );

    if (!cached) {
        return {
            cached: false,

            uploadedByThisDevice: false,

            downloadedAt: null,
        };
    }

    return {
        cached: true,

        uploadedByThisDevice:
            cached.uploadedByThisDevice,

        downloadedAt:
            cached.downloadedAt,
    };
}

export async function getEvidenceThumbnailUrl(
  evidenceId: string,
) {
  const cached =
    await getCachedEvidence(
      evidenceId,
    );

  if (!cached) {
    return null;
  }

  if (
    cached.thumbnailBlob
  ) {
    return URL.createObjectURL(
      cached.thumbnailBlob,
    );
  }

  return URL.createObjectURL(
    cached.blob,
  );
}