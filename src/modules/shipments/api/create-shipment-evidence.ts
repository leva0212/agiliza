import { createClient } from "@/lib/supabase/client";
import { generateId } from "@/shared/utils/generate-id";
import { cacheEvidenceFile } from "../services/evidence-cache-service";
import { compressImage } from "../utils/compress-image";
import { generateThumbnail } from "../utils/generate-thumbnail";
import {
  ensureUploadNotAborted,
  uploadFileWithProgress,
} from "../utils/upload-file-with-progress";

export type ShipmentEvidenceUploadProgress = {
  stage: "preparing" | "uploading" | "saving";
  percent: number;
};

type Input = {
  shipmentId: string;
  file: File;
  isProcessed?: boolean;
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
  onProgress?.({ stage: "preparing", percent: 25 });

  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const profileId = authData.user?.id;
  let companyId: string | null = null;

  if (profileId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", profileId)
      .single();
    companyId = profile?.company_id ?? null;
  }

  const compressedFile = isProcessed ? file : await compressImage(file, { hd });
  ensureUploadNotAborted(signal);
  onProgress?.({ stage: "preparing", percent: 35 });

  const thumbnailFile = await generateThumbnail(compressedFile);
  ensureUploadNotAborted(signal);
  onProgress?.({ stage: "preparing", percent: 45 });

  const uploadId = generateId();
  const extension = compressedFile.name.split(".").pop() ?? "jpg";
  const fileName = `${shipmentId}/${uploadId}.${extension}`;
  const thumbnailPath = `${shipmentId}/thumbnails/${uploadId}.jpg`;
  let databaseSaved = false;

  try {
    await uploadFileWithProgress({
      bucket: "shipment-evidences",
      path: fileName,
      file: compressedFile,
      signal,
      onProgress: (percent) => {
        onProgress?.({ stage: "uploading", percent: 45 + percent * 0.4 });
      },
    });

    ensureUploadNotAborted(signal);
    onProgress?.({ stage: "uploading", percent: 87 });

    const { error: thumbnailError } = await supabase.storage
      .from("shipment-evidences")
      .upload(thumbnailPath, thumbnailFile, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (thumbnailError) throw thumbnailError;
    ensureUploadNotAborted(signal);
    onProgress?.({ stage: "saving", percent: 92 });

    const storage = supabase.storage.from("shipment-evidences");
    const fileUrl = storage.getPublicUrl(fileName).data.publicUrl;
    const thumbnailUrl = storage.getPublicUrl(thumbnailPath).data.publicUrl;

    const { data, error } = await supabase
      .from("shipment_evidences")
      .insert({
        shipment_id: shipmentId,
        evidence_type: "photo",
        storage_path: fileName,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        original_filename: file.name,
        mime_type: compressedFile.type,
        file_size: compressedFile.size,
        created_by: createdBy ?? null,
        created_company_id: companyId,
        notes: notes?.trim() ?? "",
        validated: false,
        validated_at: null,
        validated_by: null,
      })
      .select()
      .single();

    if (error) throw error;
    databaseSaved = true;
    onProgress?.({ stage: "saving", percent: 97 });

    try {
      await cacheEvidenceFile(
        data.id,
        shipmentId,
        fileUrl,
        compressedFile,
        thumbnailFile,
      );
    } catch (cacheError) {
      console.error("[EvidenceCache] No fue posible guardar la copia local:", cacheError);
    }

    onProgress?.({ stage: "saving", percent: 100 });
    return data;
  } catch (error) {
    if (!databaseSaved) {
      const { error: cleanupError } = await supabase.storage
        .from("shipment-evidences")
        .remove([fileName, thumbnailPath]);
      if (cleanupError) {
        console.error("[ShipmentEvidence] No fue posible limpiar la carga incompleta:", cleanupError);
      }
    }
    throw error;
  }
}