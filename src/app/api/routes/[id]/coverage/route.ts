import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

async function authorizeRouteCoverageChange() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: Response.json({ message: "Debe iniciar sesión." }, { status: 401 }) };
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (error || profile?.active !== true || profile.role !== "super_admin") {
    return {
      error: Response.json(
        { message: "Solo un administrador activo puede cambiar la cobertura de una ruta." },
        { status: 403 },
      ),
    };
  }

  return { error: null };
}

async function getRouteCoverageState(routeId: string) {
  const [{ data: route, error: routeError }, { count, error: countError }] = await Promise.all([
    supabaseAdmin.from("routes").select("id, coverage_active").eq("id", routeId).maybeSingle(),
    supabaseAdmin.from("route_coverage").select("id", { count: "exact", head: true }).eq("route_id", routeId),
  ]);

  if (routeError) throw routeError;
  if (countError) throw countError;
  return { route, configuredNeighborhoods: count ?? 0 };
}

export async function GET(_request: NextRequest, context: Context) {
  const authorization = await authorizeRouteCoverageChange();
  if (authorization.error) return authorization.error;

  try {
    const { id } = await context.params;
    const state = await getRouteCoverageState(id);
    if (!state.route) return Response.json({ message: "Ruta no encontrada." }, { status: 404 });
    return Response.json({ coverageActive: state.route.coverage_active, configuredNeighborhoods: state.configuredNeighborhoods });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "No fue posible consultar la cobertura." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const authorization = await authorizeRouteCoverageChange();
  if (authorization.error) return authorization.error;

  const body = await request.json().catch(() => null) as { coverageActive?: unknown } | null;
  if (typeof body?.coverageActive !== "boolean") {
    return Response.json({ message: "El estado de cobertura es inválido." }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const { data: route, error } = await supabaseAdmin
      .from("routes")
      .update({ coverage_active: body.coverageActive })
      .eq("id", id)
      .select("coverage_active")
      .maybeSingle();

    if (error) throw error;
    if (!route) return Response.json({ message: "Ruta no encontrada." }, { status: 404 });

    const state = await getRouteCoverageState(id);
    return Response.json({ coverageActive: route.coverage_active, configuredNeighborhoods: state.configuredNeighborhoods });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "No fue posible actualizar la cobertura." }, { status: 400 });
  }
}
