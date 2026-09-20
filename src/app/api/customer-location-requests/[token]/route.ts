import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
export const runtime = "nodejs";
type Context = { params: Promise<{ token: string }> };
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export async function GET(_request: NextRequest, context: Context) {
  const { token } = await context.params;
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return Response.json({ message: "Enlace inválido o vencido." }, { status: 404 });
  const { data, error } = await supabaseAdmin.rpc("get_public_shipment_customer_location_request", { p_token_hash: tokenHash(token) });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return Response.json({ message: "Este enlace ya fue usado o venció." }, { status: 404 });
  return Response.json(Array.isArray(data) ? data[0] : data, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest, context: Context) {
  try {
    const { token } = await context.params;
    if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return Response.json({ message: "Enlace inválido o vencido." }, { status: 404 });
    const body = await request.json() as { latitude?: number; longitude?: number; accuracy?: number };
    const latitude = Number(body.latitude); const longitude = Number(body.longitude); const accuracy = Number(body.accuracy);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracy)) return Response.json({ message: "La ubicación o precisión no son válidas." }, { status: 400 });
    const { error } = await supabaseAdmin.rpc("submit_public_shipment_customer_location", { p_token_hash: tokenHash(token), p_latitude: latitude, p_longitude: longitude, p_accuracy_meters: accuracy });
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar la ubicación.";
    return Response.json({ message }, { status: 400 });
  }
}