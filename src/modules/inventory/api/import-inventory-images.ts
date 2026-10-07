import { createClient } from "@/lib/supabase/client";
import type { PendingEvidence } from "@/modules/shipments/types/pending-evidence";
import { getPendingEvidenceFile } from "@/modules/shipments/services/pending-evidence-storage";
import { processImage } from "@/shared/utils/process-image";
import { generateThumbnail } from "@/modules/shipments/utils/generate-thumbnail";
import { generateId } from "@/shared/utils/generate-id";

type Input = {
  courierId: string;
  companyId: string;
  productId: string;
  lowStock: number;
  mediumStock: number;
  items: PendingEvidence[];
};

type ImportedFile = {
  barcode: string;
  storage_path: string;
  file_url: string;
  thumbnail_url: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  notes: string;
};

const INVENTORY_IMAGE_BUCKET = "shipment-evidences";

export async function importInventoryImages({
  courierId,
  companyId,
  productId,
  lowStock,
  mediumStock,
  items,
}: Input) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) throw new Error("Debe iniciar sesión para importar inventario.");

  const barcodes = items.map((item) => item.detectedBarcode?.trim() ?? "");
  if (barcodes.some((barcode) => !barcode)) {
    throw new Error("Cada imagen debe tener un código de barras antes de importar.");
  }

  if (new Set(barcodes).size !== barcodes.length) {
    throw new Error("El mismo código aparece más de una vez en este lote.");
  }

  const uploadedPaths: string[] = [];
  const rows: ImportedFile[] = [];

  try {
    for (const item of items) {
      const originalFile = await getPendingEvidenceFile(item.id);
      if (!originalFile) {
        throw new Error(`No se encontró la imagen original de ${item.file.name}.`);
      }

      const processedFile = await processImage(originalFile, {
        hd: item.hd,
        rotation: item.rotation,
        flipX: item.flipX,
        flipY: item.flipY,
        cropX: item.cropX,
        cropY: item.cropY,
        cropWidth: item.cropWidth,
        cropHeight: item.cropHeight,
      });
      const thumbnailFile = await generateThumbnail(processedFile);
      const fileId = generateId();
      const storagePath = `inventory-imports/${userId}/${fileId}.jpg`;
      const thumbnailPath = `inventory-imports/${userId}/thumbnails/${fileId}.jpg`;

      const { error: imageError } = await supabase.storage
        .from(INVENTORY_IMAGE_BUCKET)
        .upload(storagePath, processedFile, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });
      if (imageError) throw imageError;
      uploadedPaths.push(storagePath);

      const { error: thumbnailError } = await supabase.storage
        .from(INVENTORY_IMAGE_BUCKET)
        .upload(thumbnailPath, thumbnailFile, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });
      if (thumbnailError) throw thumbnailError;
      uploadedPaths.push(thumbnailPath);

      const storage = supabase.storage.from(INVENTORY_IMAGE_BUCKET);
      rows.push({
        barcode: item.detectedBarcode!.trim(),
        storage_path: storagePath,
        file_url: storage.getPublicUrl(storagePath).data.publicUrl,
        thumbnail_url: storage.getPublicUrl(thumbnailPath).data.publicUrl,
        original_filename: originalFile.name,
        mime_type: "image/jpeg",
        file_size: processedFile.size,
        notes: item.notes,
      });
    }

    const { data, error } = await supabase.rpc("import_inventory_serialized_items", {
      p_courier_id: courierId,
      p_company_id: companyId,
      p_product_id: productId,
      p_low_stock: lowStock,
      p_medium_stock: mediumStock,
      p_created_by: userId,
      p_rows: rows,
    });
    if (error) throw error;

    return data;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from(INVENTORY_IMAGE_BUCKET)
        .remove(uploadedPaths);
      if (cleanupError) {
        console.error("[InventoryImport] No se limpiaron archivos incompletos", cleanupError);
      }
    }
    throw error;
  }
}
