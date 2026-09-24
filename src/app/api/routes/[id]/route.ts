import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };
export async function DELETE(request: NextRequest, context: Context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ message: "Debe iniciar sesión." }, { status: 401 });
  const { data: profile } = await supabaseAdmin.from("profiles").select("active, role").eq("id", user.id).maybeSingle();
  if (profile?.active !== true || profile.role !== "super_admin") return Response.json({ message: "Solo un administrador activo puede eliminar rutas." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { successorRouteId?: unknown };
  const successorRouteId = typeof body.successorRouteId === "string" ? body.successorRouteId : null;
  const { id } = await context.params;
  const { error } = await supabase.rpc("delete_route_with_optional_shipment_reassignment", { p_route_id: id, p_successor_route_id: successorRouteId });
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ success: true });
}