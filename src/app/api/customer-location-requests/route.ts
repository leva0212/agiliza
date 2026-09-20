import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ message: "Debe iniciar sesión." }, { status: 401 });
    const body = await request.json() as { shipmentId?: string };
    if (!body.shipmentId) return Response.json({ message: "Envío inválido." }, { status: 400 });
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await supabase.rpc("create_shipment_customer_location_request", { p_shipment_id: body.shipmentId, p_token_hash: tokenHash });
    if (error) throw error;
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");
    return Response.json({ url: `${baseUrl}/location/${token}`, expiresAt: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear el enlace de ubicación.";
    return Response.json({ message }, { status: 400 });
  }
}