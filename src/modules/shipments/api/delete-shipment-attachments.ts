import { createClient } from "@/lib/supabase/client";

type DeletedAttachment = {
  attachment_id: string;
  attachment_storage_path: string;
};

type StoredAttachment = {
  id: string;
  storage_path: string;
  storage_provider: "supabase" | "cloudinary";
};

export async function deleteShipmentAttachments(attachmentIds: string[]) {
  const supabase = createClient();
  const { data: storedAttachments, error: storedAttachmentsError } = await supabase
    .from("shipment_attachments")
    .select("id, storage_path, storage_provider")
    .in("id", attachmentIds)
    .is("deleted_at", null);

  if (storedAttachmentsError) {
    throw storedAttachmentsError;
  }

  const { data, error } = await supabase.rpc("soft_delete_shipment_attachments", {
    p_attachment_ids: attachmentIds,
  });

  if (error) {
    throw error;
  }

  const deletedAttachments = (data ?? []) as DeletedAttachment[];
  const deletedIds = new Set(deletedAttachments.map((attachment) => attachment.attachment_id));
  const deletedStoredAttachments = ((storedAttachments ?? []) as StoredAttachment[])
    .filter((attachment) => deletedIds.has(attachment.id));
  const paths = deletedStoredAttachments
    .filter((attachment) => attachment.storage_provider === "supabase")
    .map((attachment) => attachment.storage_path);
  const cloudinaryAttachmentIds = deletedStoredAttachments
    .filter((attachment) => attachment.storage_provider === "cloudinary")
    .map((attachment) => attachment.id);
  let storageCleanupFailed = false;

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("shipment-attachments")
      .remove(paths);

    if (storageError) {
      storageCleanupFailed = true;
      console.error("[ShipmentAttachment] Storage cleanup failed", storageError);
    }
  }

  if (cloudinaryAttachmentIds.length > 0) {
    const response = await fetch("/api/cloudinary/shipment-attachments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachmentIds: cloudinaryAttachmentIds }),
    });

    if (!response.ok) {
      storageCleanupFailed = true;
      console.error("[ShipmentAttachment] Cloudinary cleanup failed");
    }
  }

  return {
    deletedIds: deletedAttachments.map((attachment) => attachment.attachment_id),
    storageCleanupFailed,
  };
}
