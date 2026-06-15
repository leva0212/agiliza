import { createClient } from "@/lib/supabase/client";
import type { ShipmentEvidence } from "../types/shipment-evidence";
import { getCurrentProfile } from "@/modules/auth/hooks/use-current-profile";

export async function getShipmentEvidences(
  shipmentId: string,
): Promise<ShipmentEvidence[]> {
  const supabase = createClient();

  const profile =
    await getCurrentProfile();

  if (!profile) {
    return [];
  }

  let query =
    supabase
      .from("shipment_evidences")
      .select(`
        *,

        validator:profiles!shipment_evidences_validated_by_fkey(
          id,
          full_name
        ),

        creator:profiles!shipment_evidences_created_by_fkey(
          id,
          full_name,
          company_id,

          company:companies(
            id,
            name,
            is_owner_company
          )
        )
      `)
      .eq(
        "shipment_id",
        shipmentId,
      );

  if (
    !profile.is_owner_company_user
  ) {
    query =
      query.or(
        [
          "validated.eq.true",

          `created_company_id.eq.${profile.company_id}`,
        ].join(","),
      );
  }

  const {
    data,
    error,
  } = await query.order(
    "created_at",
    {
      ascending: false,
    },
  );

  if (error) {
    throw error;
  }

  const normalized =
    (data ?? []).map(
      (evidence) => ({
        ...evidence,

        validator:
          Array.isArray(
            evidence.validator,
          )
            ? evidence.validator[0] ??
            null
            : evidence.validator,

        creator:
          Array.isArray(
            evidence.creator,
          )
            ? evidence.creator[0] ??
            null
            : evidence.creator,
      }),
    );

  return normalized;
}