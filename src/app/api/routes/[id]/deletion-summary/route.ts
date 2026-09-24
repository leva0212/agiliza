import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ message: "Debe iniciar sesión." }, { status: 401 });

  const { data: profile } = await supabaseAdmin.from("profiles").select("active, role").eq("id", user.id).maybeSingle();
  if (profile?.active !== true || profile.role !== "super_admin") {
    return Response.json({ message: "Solo un administrador activo puede eliminar rutas." }, { status: 403 });
  }

  const { id } = await context.params;
  const [{ data: route, error: routeError }, { count: rateCount, error: ratesError }, { count: shipmentCount, error: shipmentsError }] = await Promise.all([
    supabaseAdmin.from("routes").select("id, name").eq("id", id).maybeSingle(),
    supabaseAdmin.from("courier_delivery_rates").select("id", { count: "exact", head: true }).eq("route_id", id),
    supabaseAdmin.from("shipments").select("id", { count: "exact", head: true }).eq("route_id", id),
  ]);
  if (routeError || ratesError || shipmentsError) return Response.json({ message: routeError?.message ?? ratesError?.message ?? shipmentsError?.message ?? "No fue posible revisar la ruta." }, { status: 400 });
  if (!route) return Response.json({ message: "Ruta no encontrada." }, { status: 404 });

  return Response.json({ courierDeliveryRates: rateCount ?? 0, shipments: shipmentCount ?? 0 });
}