import { createClient } from "@/lib/supabase/client";
import { compressImage } from "../utils/compress-image";
import {
    cacheEvidenceFile,
} from "../services/evidence-cache-service";
import { generateId }
  from "@/shared/utils/generate-id";
import { generateThumbnail }
    from "../utils/generate-thumbnail";

type Input = {
    shipmentId: string;

    file: File;

    notes?: string;

    createdBy?: string | null;
};

export async function createShipmentEvidence({
    shipmentId,
    file,
    notes,
    createdBy,
}: Input) {
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

    const compressedFile = await compressImage(file);
    const thumbnailFile =
        await generateThumbnail(
            compressedFile,
        );

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

    const uploadResult = await supabase.storage
        .from("shipment-evidences")
        .upload(fileName, compressedFile);

    if (uploadResult.error) {
        throw uploadResult.error;
    }

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

    return data;
}