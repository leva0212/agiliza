import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ message: "Debe iniciar sesión." }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("active, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.active !== true || profile.role !== "super_admin") {
    return Response.json({ message: "Solo un administrador activo puede cambiar el estado de una ruta." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { active?: unknown } | null;
  if (typeof body?.active !== "boolean") return Response.json({ message: "El estado de la ruta es inválido." }, { status: 400 });

  const { id } = await context.params;
  const { data, error } = await supabaseAdmin
    .from("routes")
    .update({ active: body.active })
    .eq("id", id)
    .select("id, name, active")
    .maybeSingle();
  if (error) return Response.json({ message: error.message }, { status: 400 });
  if (!data) return Response.json({ message: "Ruta no encontrada." }, { status: 404 });

  return Response.json(data);
}