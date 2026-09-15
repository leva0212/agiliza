import { createHash } from "crypto";
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ message: "No autorizado." }, { status: 401 });
    }

    const { attachmentIds } = (await request.json()) as { attachmentIds?: string[] };
    if (!Array.isArray(attachmentIds) || attachmentIds.length === 0) {
      return Response.json({ message: "No se indicaron adjuntos." }, { status: 400 });
    }

    const { data: attachments, error } = await supabase
      .from("shipment_attachments")
      .select("id, storage_path")
      .in("id", attachmentIds)
      .eq("storage_provider", "cloudinary")
      .eq("deleted_by", user.id);

    if (error) {
      throw error;
    }

    if ((attachments?.length ?? 0) !== attachmentIds.length) {
      return Response.json({ message: "No está autorizado para eliminar estos videos." }, { status: 403 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    await Promise.all(
      (attachments ?? []).map(async (attachment) => {
        const signature = createHash("sha1")
          .update(`invalidate=true&public_id=${attachment.storage_path}&timestamp=${timestamp}${apiSecret}`)
          .digest("hex");
        const body = new URLSearchParams({
          public_id: attachment.storage_path,
          timestamp: String(timestamp),
          api_key: apiKey,
          signature,
          invalidate: "true",
        });
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/video/destroy`,
          { method: "POST", body },
        );

        if (!response.ok) {
          throw new Error("Cloudinary no pudo eliminar el video.");
        }
      }),
    );

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible eliminar los videos.";
    return Response.json({ message }, { status: 500 });
  }
}
