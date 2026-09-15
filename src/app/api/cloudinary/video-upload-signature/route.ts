import { createHash, randomUUID } from "crypto";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado en el servidor.");
  }

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ message: "No autorizado." }, { status: 401 });
    }

    const { shipmentId } = (await request.json()) as { shipmentId?: string };
    if (!shipmentId) {
      return Response.json({ message: "Envío no válido." }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `syslogistics/shipments/${shipmentId}`;
    const publicId = randomUUID();
    // Los videos grandes se procesan en segundo plano. Así la carga no falla
    // mientras Cloudinary genera la versión MP4 optimizada.
    const eager = "c_limit,w_1920/q_auto:good/f_mp4";
    const eagerNotificationUrl = process.env.CLOUDINARY_EAGER_NOTIFICATION_URL;
    const parameters = [
      ["eager", eager],
      ["eager_async", "true"],
      ["folder", folder],
      ["public_id", publicId],
      ["timestamp", String(timestamp)],
      ...(eagerNotificationUrl ? [["eager_notification_url", eagerNotificationUrl]] : []),
    ]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const signature = createHash("sha1")
      .update(`${parameters}${apiSecret}`)
      .digest("hex");

    return Response.json({
      cloudName,
      apiKey,
      timestamp,
      folder,
      publicId,
      signature,
      eager,
      eagerNotificationUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible preparar la subida del video.";
    return Response.json({ message }, { status: 500 });
  }
}
