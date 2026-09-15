import { createHash, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type CloudinaryEagerAsset = {
  secure_url?: string;
  bytes?: number;
};

type CloudinaryEagerNotification = {
  public_id?: string;
  eager?: CloudinaryEagerAsset[];
};

function isValidSignature(body: string, timestamp: string | null, signature: string | null) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret || !timestamp || !signature) {
    return false;
  }

  const expected = createHash("sha1")
    .update(`${body}${timestamp}${apiSecret}`)
    .digest("hex");

  return signature.length === expected.length && timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!isValidSignature(
    body,
    request.headers.get("x-cld-timestamp"),
    request.headers.get("x-cld-signature"),
  )) {
    return Response.json({ message: "Firma de Cloudinary inválida." }, { status: 401 });
  }

  try {
    const notification = JSON.parse(body) as CloudinaryEagerNotification;
    const optimizedAsset = notification.eager?.[0];

    if (!notification.public_id || !optimizedAsset?.secure_url) {
      return Response.json({ message: "Notificación de Cloudinary incompleta." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("shipment_attachments")
      .update({
        file_url: optimizedAsset.secure_url,
        optimized_file_size: optimizedAsset.bytes ?? null,
        optimized_at: new Date().toISOString(),
      })
      .eq("storage_provider", "cloudinary")
      .eq("storage_path", notification.public_id);

    if (error) {
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible registrar la optimización.";
    return Response.json({ message }, { status: 500 });
  }
}
