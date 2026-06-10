import { createClient }
  from "@/lib/supabase/client";

type Input = {

  shipmentId: string;

  status:
    | "created"
    | "assigned"
    | "in_route"
    | "delivered"
    | "failed_attempt"
    | "rejected"
    | "cancelled";

  rejectionReason?: string;

  cancellationReason?: string;

};

export async function updateShipmentStatus(
  input: Input,
) {

  const supabase =
    createClient();
    const {
  data: shipment,
} = await supabase

  .from(
    "shipments",
  )

  .select(
    "status",
  )

  .eq(
    "id",
    input.shipmentId,
  )

  .single();

  const {
  data: auth,
} = await supabase.auth.getUser();

if (!auth.user) {

  throw new Error(
    "Usuario no autenticado",
  );

}



  const payload: Record<
    string,
    unknown
  > = {

    status:
      input.status,

  };

  if (
    input.status ===
    "delivered"
  ) {

    payload.delivered_at =
      new Date()
        .toISOString();

  }

  if (
    input.status ===
    "rejected"
  ) {

    payload.rejection_reason =
      input.rejectionReason ??
      null;

  }

  if (
    input.status ===
    "cancelled"
  ) {

    payload.cancellation_reason =
      input.cancellationReason ??
      null;

  }

  const {
    error,
  } = await supabase

    .from(
      "shipments",
    )

    .update(
      payload,
    )

    .eq(
      "id",
      input.shipmentId,
    );

  if (error) {
    throw error;
  }

  await supabase

  .from(
    "shipment_status_history",
  )

  .insert({

    shipment_id:
      input.shipmentId,

    previous_status:
      shipment?.status ?? null,

    status:
      input.status,

    notes:
      null,

    created_by:
      auth.user.id,

  });

}