import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
type Body = { districtIds?: unknown; neighborhoodIds?: unknown; action?: unknown };
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ message: "No autorizado." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("active, role").eq("id", user.id).single();
  if (profile?.active !== true || profile.role !== "super_admin") return Response.json({ message: "Solo un superadministrador activo puede agregar cobertura." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as Body;
  const ids = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((item): item is number => typeof item === "number" && Number.isInteger(item) && item > 0))] : [];
  const districtIds = ids(body.districtIds), neighborhoodIds = ids(body.neighborhoodIds);
  if (!districtIds.length && !neighborhoodIds.length) return Response.json({ message: "Selecciona al menos un distrito o barrio." }, { status: 400 });
  const { id } = await context.params;
  const action = body.action === "remove" ? "remove" : "add";
  const { data, error } = await supabase.rpc(action === "remove" ? "remove_route_bulk_coverage_with_neighborhoods" : "add_route_bulk_coverage_with_neighborhoods", { p_route_id: id, p_district_ids: districtIds, p_neighborhood_ids: neighborhoodIds });
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json(data?.[0] ?? { added_neighborhoods: 0, removed_neighborhoods: 0, affected_districts: 0 });
}