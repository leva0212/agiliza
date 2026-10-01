import { NextRequest } from "next/server";

import { getPublicAppUrl, sendAccountEmail } from "@/lib/email/server";
import { consumeRateLimit, createOpaqueToken, hashOpaqueToken, resolveProfileIdentifier } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

const GENERIC_MESSAGE = "Si la cuenta existe y tiene un correo verificado, enviaremos instrucciones. Si no las recibe, puede solicitar ayuda a Agiliza.";

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();
    if (typeof identifier !== "string" || !identifier.trim()) return Response.json({ message: GENERIC_MESSAGE });
    const allowed = await consumeRateLimit("forgot_password", identifier);
    if (!allowed) return Response.json({ message: GENERIC_MESSAGE });

    const profile = await resolveProfileIdentifier(identifier);
    if (!profile?.active || !profile.recovery_email || !profile.recovery_email_verified_at) {
      return Response.json({ message: GENERIC_MESSAGE });
    }

    await supabaseAdmin.from("account_password_reset_tokens").update({ invalidated_at: new Date().toISOString() })
      .eq("profile_id", profile.id).is("used_at", null).is("invalidated_at", null);
    const token = createOpaqueToken();
    const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
    const { error } = await supabaseAdmin.from("account_password_reset_tokens").insert({
      profile_id: profile.id, token_hash: hashOpaqueToken(token), expires_at: expiresAt,
    });
    if (error) throw error;

    const link = `${getPublicAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    await sendAccountEmail({
      to: profile.recovery_email,
      subject: "Restablece tu contraseña de Agiliza",
      text: `Usa este enlace para establecer una nueva contraseña: ${link}. Expira en 30 minutos.`,
      html: `<p>Usa este enlace para establecer una nueva contraseña:</p><p><a href="${link}">Restablecer contraseña</a></p><p>Expira en 30 minutos.</p>`,
    });
  } catch {
    // The public response deliberately does not reveal account or mail-provider state.
  }
  return Response.json({ message: GENERIC_MESSAGE });
}
