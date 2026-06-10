import {
  createClient,
} from "@/lib/supabase/client";

export async function getShipmentStatusHistory(
  shipmentId: string,
) {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "shipment_status_history",
    )

    .select(`
      id,

      shipment_id,

      previous_status,

      status,

      notes,

      created_at,

      created_by,

      profile:profiles(
        id,
        full_name
      )
    `)

    .eq(
      "shipment_id",
      shipmentId,
    )

    .order(
      "created_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

  return (

    data ?? []

  ).map(
    item => ({

      ...item,

      profile:
        Array.isArray(
          item.profile,
        )
          ? item.profile[0] ?? null
          : item.profile,

    }),
  );

}