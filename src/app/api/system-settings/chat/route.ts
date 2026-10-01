import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getActor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id,role,active,company:companies(is_owner_company,is_system_company)")
    .eq("id", user.id)
    .maybeSingle();
  const company = Array.isArray(profile?.company) ? profile.company[0] : profile?.company;
  if (!profile?.active || (!company?.is_owner_company && !company?.is_system_company)) return null;
  return profile;
}

export async function GET() {
  const actor = await getActor();
  if (!actor) return Response.json({ message: "No autorizado." }, { status: 403 });
  const { data, error } = await supabaseAdmin
    .from("system_settings")
    .select("dts_chat_enabled,restricted_supervisor_mode,updated_at,updated_by")
    .eq("id", true)
    .single();
  if (error) return Response.json({ message: "Ejecuta primero la migración de configuración global." }, { status: 503 });
  return Response.json({
    ...data,
    can_manage_restricted_supervisor_mode: actor.role === "super_admin",
  });
}

export async function PATCH(request: NextRequest) {
  const actor = await getActor();
  if (!actor || !["super_admin", "company_admin"].includes(actor.role)) {
    return Response.json({ message: "Solo administradores y supervisores EPS pueden cambiar esta configuración." }, { status: 403 });
  }
  const body = await request.json();
  if (typeof body.dts_chat_enabled !== "boolean" || typeof body.restricted_supervisor_mode !== "boolean") {
    return Response.json({ message: "El valor de la configuración no es válido." }, { status: 400 });
  }
  const { data: current, error: readError } = await supabaseAdmin
    .from("system_settings")
    .select("dts_chat_enabled,restricted_supervisor_mode")
    .eq("id", true)
    .single();
  if (readError) return Response.json({ message: "Ejecuta primero la migración de configuración global." }, { status: 503 });
  if (actor.role !== "super_admin" && current.restricted_supervisor_mode !== body.restricted_supervisor_mode) {
    return Response.json({ message: "Solo un administrador puede cambiar el modo restringido para supervisores EPS." }, { status: 403 });
  }
  if (actor.role !== "super_admin" && current.restricted_supervisor_mode && body.restricted_supervisor_mode && current.dts_chat_enabled !== body.dts_chat_enabled) {
    return Response.json({ message: "Desactiva primero el modo restringido para modificar el chat de empresas DTS." }, { status: 400 });
  }
  if (current.dts_chat_enabled === body.dts_chat_enabled && current.restricted_supervisor_mode === body.restricted_supervisor_mode) return Response.json({ success: true, changed: false });

  const { error } = await supabaseAdmin
    .from("system_settings")
    .update({ dts_chat_enabled: body.dts_chat_enabled, restricted_supervisor_mode: body.restricted_supervisor_mode, updated_at: new Date().toISOString(), updated_by: actor.id })
    .eq("id", true);
  if (error) return Response.json({ message: "No fue posible guardar la configuración." }, { status: 400 });
  return Response.json({ success: true, changed: true });
}
