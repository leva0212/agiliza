import { createClient } from "@/lib/supabase/client";
import { generateId } from "@/shared/utils/generate-id";
import {
  ensureUploadNotAborted,
  UploadAbortedError,
  uploadFileWithProgress,
} from "../utils/upload-file-with-progress";
import type { ShipmentEvidenceUploadProgress } from "./create-shipment-evidence";

type Input = {
  shipmentId: string;
  file: File;
  notes?: string;
  signal?: AbortSignal;
  onProgress?: (progress: ShipmentEvidenceUploadProgress) => void;
};

type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId: string;
  signature: string;
  eager: string;
  eagerNotificationUrl: string | undefined;
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

async function getCloudinaryVideoSignature(shipmentId: string): Promise<CloudinarySignature> {
  const response = await fetch("/api/cloudinary/video-upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shipmentId }),
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "No fue posible preparar la subida del video.");
  }

  return body as CloudinarySignature;
}

async function uploadVideoToCloudinary({
  file,
  signature,
  signal,
  onProgress,
}: {
  file: File;
  signature: CloudinarySignature;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}): Promise<CloudinaryUploadResult> {
  ensureUploadNotAborted(signal);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abortRequest = () => request.abort();
    const cleanup = () => signal?.removeEventListener("abort", abortRequest);

    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/video/upload`,
    );
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      cleanup();
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve(JSON.parse(request.responseText) as CloudinaryUploadResult);
        return;
      }

      try {
        const response = JSON.parse(request.responseText) as {
          error?: { message?: string };
        };
        reject(new Error(response.error?.message ?? "Cloudinary no pudo subir el video."));
      } catch {
        reject(new Error("Cloudinary no pudo subir el video."));
      }
    };
    request.onerror = () => {
      cleanup();
      reject(new Error("Ocurrió un error de red durante la subida del video."));
    };
    request.onabort = () => {
      cleanup();
      reject(new UploadAbortedError());
    };

    signal?.addEventListener("abort", abortRequest, { once: true });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("folder", signature.folder);
    formData.append("public_id", signature.publicId);
    formData.append("eager", signature.eager);
    formData.append("eager_async", "true");
    if (signature.eagerNotificationUrl) {
      formData.append("eager_notification_url", signature.eagerNotificationUrl);
    }
    formData.append("signature", signature.signature);
    request.send(formData);
  });
}

export async function createShipmentAttachment({
  shipmentId,
  file,
  notes,
  signal,
  onProgress,
}: Input) {
  ensureUploadNotAborted(signal);
  onProgress?.({ stage: "preparing", percent: 15 });

  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error("Debe iniciar sesión para subir adjuntos.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile?.company_id) {
    throw profileError ?? new Error("No fue posible identificar la empresa.");
  }

  const isVideo = file.type.startsWith("video/");
  let storagePath: string;
  let fileUrl: string;
  let storageProvider: "supabase" | "cloudinary";

  if (isVideo) {
    const signature = await getCloudinaryVideoSignature(shipmentId);
    const uploadedVideo = await uploadVideoToCloudinary({
      file,
      signature,
      signal,
      onProgress: (percent) => onProgress?.({ stage: "uploading", percent: 20 + percent * 0.7 }),
    });
    storagePath = uploadedVideo.public_id;
    fileUrl = `https://res.cloudinary.com/${encodeURIComponent(signature.cloudName)}/video/upload/${signature.eager}/${uploadedVideo.public_id}.mp4`;
    storageProvider = "cloudinary";
  } else {
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "file";
    storagePath = `${shipmentId}/${generateId()}.${extension}`;
    await uploadFileWithProgress({
      bucket: "shipment-attachments",
      path: storagePath,
      file,
      signal,
      onProgress: (percent) => {
        onProgress?.({ stage: "uploading", percent: 20 + percent * 0.7 });
      },
    });
    const { data: publicUrlData } = supabase.storage
      .from("shipment-attachments")
      .getPublicUrl(storagePath);
    fileUrl = publicUrlData.publicUrl;
    storageProvider = "supabase";
  }

  ensureUploadNotAborted(signal);
  onProgress?.({ stage: "saving", percent: 92 });

  const { data, error } = await supabase
    .from("shipment_attachments")
    .insert({
      shipment_id: shipmentId,
      storage_path: storagePath,
      storage_provider: storageProvider,
      file_url: fileUrl,
      original_filename: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      optimized_file_size: null,
      notes: notes?.trim() ?? "",
      created_by: authData.user.id,
      created_company_id: profile.company_id,
    })
    .select()
    .single();

  if (error) {
    if (storageProvider === "supabase") {
      await supabase.storage.from("shipment-attachments").remove([storagePath]);
    }
    throw error;
  }

  onProgress?.({ stage: "saving", percent: 100 });
  return data;
}
