import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  authorizeShipmentAccess,
  sanitizeActor,
} from "@/modules/auth/server/shipment-actor-privacy";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/shipments/[id]/evidences">,
) {
  const { id } = await context.params;
  const access = await authorizeShipmentAccess(id);

  if (!access.allowed) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: access.status },
    );
  }

  let query = supabaseAdmin
    .from("shipment_evidences")
    .select(`
      *,
      validator:profiles!shipment_evidences_validated_by_fkey(
        id, full_name, role, company_id,
        company:companies(id, name, trade_name, is_owner_company)
      ),
      creator:profiles!shipment_evidences_created_by_fkey(
        id, full_name, role, company_id,
        company:companies(id, name, trade_name, is_owner_company)
      ),
      deleted_by_profile:profiles!shipment_evidences_deleted_by_fkey(
        id, full_name, role, company_id,
        company:companies(id, name, trade_name, is_owner_company)
      )
    `)
    .eq("shipment_id", id);

  if (!access.viewer.isOwnerCompanyUser) {
    query = query.or(
      `validated.eq.true,created_company_id.eq.${access.viewer.companyId}`,
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const result = (data ?? []).map((evidence) => ({
    ...evidence,
    validator: sanitizeActor(access.viewer, evidence.validator),
    creator: sanitizeActor(access.viewer, evidence.creator),
    deleted_by_profile: sanitizeActor(access.viewer, evidence.deleted_by_profile),
  }));

  return NextResponse.json(
    { data: result },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}