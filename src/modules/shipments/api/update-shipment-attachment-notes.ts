import { createClient } from "@/lib/supabase/client";

type Input = {
  attachmentId: string;
  notes: string;
};

export async function updateShipmentAttachmentNotes({
  attachmentId,
  notes,
}: Input) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "update_shipment_attachment_notes",
    {
      p_attachment_id: attachmentId,
      p_notes: notes,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}
