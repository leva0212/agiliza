import { getCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { createClient } from "@/lib/supabase/client";
import type { ShipmentAttachment } from "../types/shipment-attachment";

export async function getShipmentAttachments(
  shipmentId: string,
): Promise<ShipmentAttachment[]> {
  const profile = await getCurrentProfile();

  if (!profile) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("shipment_attachments")
    .select(`
      *,
      creator:profiles!shipment_attachments_created_by_fkey(
        id,
        full_name,
        company_id,
        company:companies(id, name, trade_name)
      ),
      deleted_by_profile:profiles!shipment_attachments_deleted_by_fkey(
        id,
        full_name
      )
    `)
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((attachment) => ({
    ...attachment,
    creator: Array.isArray(attachment.creator)
      ? attachment.creator[0] ?? null
      : attachment.creator,
    deleted_by_profile: Array.isArray(attachment.deleted_by_profile)
      ? attachment.deleted_by_profile[0] ?? null
      : attachment.deleted_by_profile,
  }));
}
