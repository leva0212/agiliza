import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = { districtIds?: unknown; minHours?: unknown; maxHours?: unknown; days?: unknown };

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ message: "No autorizado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("active, role").eq("id", user.id).single();
  if (profile?.active !== true || profile.role !== "super_admin") return Response.json({ message: "Solo un superadministrador activo puede aplicar cambios masivos." }, { status: 403 });

  const body = await request.json().catch(() => ({})) as Body;
  const districtIds = Array.isArray(body.districtIds) ? [...new Set(body.districtIds.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0))] : [];
  const days = Array.isArray(body.days) ? body.days.filter((day): day is string => typeof day === "string") : [];
  const minHours = typeof body.minHours === "number" ? body.minHours : NaN;
  const maxHours = typeof body.maxHours === "number" ? body.maxHours : NaN;
  if (!districtIds.length) return Response.json({ message: "Selecciona al menos un distrito." }, { status: 400 });

  const { id } = await context.params;
  const { data, error } = await supabase.rpc("apply_route_bulk_schedule", {
    p_route_id: id,
    p_district_ids: districtIds,
    p_min_hours: minHours,
    p_max_hours: maxHours,
    p_days: days,
  });
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ updatedDistricts: data });
}