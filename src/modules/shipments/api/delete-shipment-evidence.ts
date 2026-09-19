import { createClient } from "@/lib/supabase/client";
import { deleteCachedEvidence } from "../services/evidence-cache-service";

type DeletedEvidence = {
    evidence_id: string;
    evidence_storage_path: string | null;
};

export async function deleteShipmentEvidences(
    evidenceIds: string[],
) {
    if (evidenceIds.length === 0) {
        return {
            deletedIds: [],
            storageCleanupFailed: false,
        };
    }

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
        "soft_delete_shipment_evidences",
        {
            p_evidence_ids: evidenceIds,
        },
    );

    if (error) {
        throw error;
    }

    const deletedEvidences =
        (data ?? []) as DeletedEvidence[];

    let storageCleanupFailed = false;

    const storagePaths = deletedEvidences.flatMap((evidence) => {
        const path = evidence.evidence_storage_path;
        if (!path) return [];

        const lastSlash = path.lastIndexOf("/");
        const directory = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
        const filename = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
        const basename = filename.replace(/\.[^.]+$/, "");
        const thumbnailPath = `${directory ? `${directory}/` : ""}thumbnails/${basename}.jpg`;
        return [path, thumbnailPath];
    });

    if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
            .from("shipment-evidences")
            .remove(storagePaths);

        if (storageError) {
            storageCleanupFailed = true;
            console.error(
                "[ShipmentEvidence] No fue posible limpiar archivos eliminados:",
                storageError,
            );
        }
    }

    await Promise.all(
        deletedEvidences.map((evidence) =>
            deleteCachedEvidence(evidence.evidence_id),
        ),
    );


    return {
        deletedIds: deletedEvidences.map(
            (evidence) => evidence.evidence_id,
        ),
        storageCleanupFailed,
    };
}

export async function deleteShipmentEvidence(
    evidenceId: string,
) {
    return deleteShipmentEvidences([evidenceId]);
}
