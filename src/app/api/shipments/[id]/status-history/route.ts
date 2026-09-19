import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  authorizeShipmentAccess,
  sanitizeActor,
} from "@/modules/auth/server/shipment-actor-privacy";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/shipments/[id]/status-history">,
) {
  const { id } = await context.params;
  const access = await authorizeShipmentAccess(id);

  if (!access.allowed) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: access.status },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("shipment_status_history")
    .select(`
      id, shipment_id, previous_status, status, notes, created_at, created_by,
      profile:profiles(
        id, full_name, role, company_id,
        company:companies(id, name, trade_name, is_owner_company)
      )
    `)
    .eq("shipment_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const result = (data ?? []).map((entry) => ({
    ...entry,
    profile: sanitizeActor(access.viewer, entry.profile),
  }));

  return NextResponse.json(
    { data: result },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}