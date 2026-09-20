import { createClient } from "@/lib/supabase/server";
import { customerLocationSchema } from "@/modules/shipments/utils/customer-location-schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ message: "Debe iniciar sesión." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role, active").eq("id", user.id).single();
  if (profileError || !profile?.active || !["super_admin", "company_admin", "seller"].includes(profile.role)) {
    return Response.json({ message: "No tiene permiso para modificar la ubicación." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = customerLocationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Ingrese una latitud entre -90 y 90 y una longitud entre -180 y 180." }, { status: 400 });
  }
  const { id } = await context.params;
  // La sesión del usuario conserva las políticas RLS de edición de envíos.
  const { data, error } = await supabase.from("shipments").update({
    customer_latitude: parsed.data.latitude,
    customer_longitude: parsed.data.longitude,
    customer_location_accuracy_meters: null,
    customer_location_received_at: new Date().toISOString(),
  }).eq("id", id).select("id").maybeSingle();

  if (error) return Response.json({ message: "No fue posible guardar la ubicación del envío." }, { status: 400 });
  if (!data) return Response.json({ message: "Envío no encontrado o sin permiso para modificarlo." }, { status: 403 });
  return Response.json({ success: true });
}
