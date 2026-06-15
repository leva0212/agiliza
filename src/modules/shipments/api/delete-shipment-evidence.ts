import { createClient } from "@/lib/supabase/client";

export async function deleteShipmentEvidence(
    evidenceId: string,
) {
    const supabase = createClient();

    const { data: evidence, error: loadError } =
        await supabase
            .from("shipment_evidences")
            .select("storage_path")
            .eq("id", evidenceId)
            .single();

    if (loadError) {
        throw loadError;
    }

    if (evidence?.storage_path) {
        const { error: storageError } =
            await supabase.storage
                .from("shipment-evidences")
                .remove([
                    evidence.storage_path,
                ]);

        if (storageError) {
            throw storageError;
        }
    }

    const { error } = await supabase
        .from("shipment_evidences")
        .delete()
        .eq("id", evidenceId);

    if (error) {
        throw error;
    }

    console.log(
        "[ShipmentEvidence] Eliminada:",
        evidenceId,
    );
}