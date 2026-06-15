import { createClient } from "@/lib/supabase/client";

type Input = {
    shipmentId: string;
    profileId: string;
};

export async function validateAllShipmentEvidences({
    shipmentId,
    profileId,
}: Input) {
    const supabase = createClient();

    const { error } = await supabase
        .from("shipment_evidences")
        .update({
            validated: true,
            validated_at: new Date().toISOString(),
            validated_by: profileId,
        })
        .eq("shipment_id", shipmentId)
        .eq("validated", false);

    if (error) {
        throw error;
    }
}