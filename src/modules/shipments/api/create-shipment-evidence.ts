import { createClient } from "@/lib/supabase/client";
import { compressImage } from "../utils/compress-image";
import {
    cacheEvidenceFile,
} from "../services/evidence-cache-service";
import { generateId }
  from "@/shared/utils/generate-id";
import { generateThumbnail }
    from "../utils/generate-thumbnail";
import {
    ensureUploadNotAborted,
    UploadAbortedError,
    uploadFileWithProgress,
} from "../utils/upload-file-with-progress";

export type ShipmentEvidenceUploadProgress = {
    stage: "preparing" | "uploading" | "saving";
    percent: number;
};

type Input = {
    shipmentId: string;

    file: File;

    /**
     * The evidence editor already applies crop, rotation and selected quality.
     * Do not encode that resulting image for a second time.
     */
    isProcessed?: boolean;

    /** Used only when this API receives an unprocessed file. */
    hd?: boolean;

    notes?: string;

    createdBy?: string | null;

    signal?: AbortSignal;

    onProgress?: (progress: ShipmentEvidenceUploadProgress) => void;
};

export async function createShipmentEvidence({
    shipmentId,
    file,
    isProcessed = false,
    hd = false,
    notes,
    createdBy,
    signal,
    onProgress,
}: Input) {
    ensureUploadNotAborted(signal);

    onProgress?.({
        stage: "preparing",
        percent: 25,
    });

    const supabase = createClient();
    const {
        data: authData,
    } = await supabase.auth.getUser();

    const profileId =
        authData.user?.id;

    let companyId: string | null =
        null;

    if (profileId) {
        const {
            data: profile,
        } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", profileId)
            .single();

        companyId =
            profile?.company_id ?? null;
    }

    const compressedFile = isProcessed
        ? file
        : await compressImage(file, { hd });

    ensureUploadNotAborted(signal);

    onProgress?.({
        stage: "preparing",
        percent: 35,
    });

    const thumbnailFile =
        await generateThumbnail(
            compressedFile,
        );

    ensureUploadNotAborted(signal);

    onProgress?.({
        stage: "preparing",
        percent: 45,
    });

    console.log(
        "[ShipmentEvidence] Thumbnail:",
        `${(
            thumbnailFile.size /
            1024
        ).toFixed(0)} KB`,
    );

    console.log(
        "[ShipmentEvidence] Original:",
        `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        `${file.type}`,
        `${file.name}`,
    );

    console.log(
        "[ShipmentEvidence] Comprimida:",
        `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
        `${compressedFile.type}`,
        `${compressedFile.name}`,
    );

    console.log(
        "[ShipmentEvidence] Reducción:",
        `${(
            (1 - compressedFile.size / file.size) *
            100
        ).toFixed(1)}%`,
    );

    const extension =
        compressedFile.name.split(".").pop() ?? "jpg";

    const fileName =
        `${shipmentId}/${generateId()}.${extension}`;

    let storageUploaded = false;

    try {
        await uploadFileWithProgress({
            bucket: "shipment-evidences",
            path: fileName,
            file: compressedFile,
            signal,
            onProgress: (percent) => {
                onProgress?.({
                    stage: "uploading",
                    percent: 45 + percent * 0.45,
                });
            },
        });

        storageUploaded = true;

        ensureUploadNotAborted(signal);

        onProgress?.({
            stage: "saving",
            percent: 92,
        });

        const { data: publicUrlData } = supabase.storage
            .from("shipment-evidences")
            .getPublicUrl(fileName);

        const fileUrl = publicUrlData.publicUrl;

        const { data, error } = await supabase
            .from("shipment_evidences")
            .insert({
                shipment_id: shipmentId,

                evidence_type: "photo",

                storage_path: fileName,

                file_url: fileUrl,

                original_filename: file.name,

                mime_type: compressedFile.type,

                file_size: compressedFile.size,

                created_by: createdBy ?? null,

                created_company_id:
                    companyId,
                notes: notes?.trim() ?? "",

                validated: false,

                validated_at: null,

                validated_by: null,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        onProgress?.({
            stage: "saving",
            percent: 97,
        });

        console.log(
            "[ShipmentEvidence] Guardada:",
            {
                shipmentId,
                evidenceId: data.id,
                fileUrl,
                storagePath: fileName,
            },
        );

        await cacheEvidenceFile(
            data.id,
            shipmentId,
            fileUrl,
            compressedFile,
            thumbnailFile,
        );

        onProgress?.({
            stage: "saving",
            percent: 100,
        });

        return data;
    } catch (error) {
        if (storageUploaded && error instanceof UploadAbortedError) {
            await supabase.storage
                .from("shipment-evidences")
                .remove([fileName]);
        }

        throw error;
    }
}
