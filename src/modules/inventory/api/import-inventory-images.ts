import { createClient } from "@/lib/supabase/client";
import type { PendingEvidence } from "@/modules/shipments/types/pending-evidence";
import { getPendingEvidenceFile } from "@/modules/shipments/services/pending-evidence-storage";
import { editorAsset } from "@/modules/shipments/services/editor-image-assets";
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

function describeImportError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const value = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const parts = [value.message, value.details, value.hint]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0);
    const code = typeof value.code === "string" && value.code ? ` (${value.code})` : "";
    if (parts.length > 0) return `${Array.from(new Set(parts)).join(" — ")}${code}`;
  }
  return String(error || "Error desconocido");
}

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

      const processedFile = await editorAsset(item);
      const thumbnailFile = await editorAsset(item, true);
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
      if (imageError) {
        throw new Error(
          `No se pudo subir la foto ${originalFile.name}: ${describeImportError(imageError)}`,
        );
      }
      uploadedPaths.push(storagePath);

      const { error: thumbnailError } = await supabase.storage
        .from(INVENTORY_IMAGE_BUCKET)
        .upload(thumbnailPath, thumbnailFile, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });
      if (thumbnailError) {
        throw new Error(
          `No se pudo subir la miniatura de ${originalFile.name}: ${describeImportError(thumbnailError)}`,
        );
      }
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
    if (error) {
      throw new Error(
        `No se pudieron registrar las existencias: ${describeImportError(error)}`,
      );
    }

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
