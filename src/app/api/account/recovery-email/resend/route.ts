import { createClient } from "@/lib/supabase/server";
import { getPublicAppUrl, sendAccountEmail } from "@/lib/email/server";
import { createOpaqueToken, hashOpaqueToken } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const session = await createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return Response.json({ message: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabaseAdmin.from("profiles").select("recovery_email,recovery_email_verified_at").eq("id", user.id).single();
    if (!profile?.recovery_email || profile.recovery_email_verified_at) return Response.json({ message: "No hay un correo pendiente de verificación." }, { status: 400 });
    await supabaseAdmin.from("account_email_verifications").update({ invalidated_at: new Date().toISOString() }).eq("profile_id", user.id).is("used_at", null).is("invalidated_at", null);
    const token = createOpaqueToken();
    const { error } = await supabaseAdmin.from("account_email_verifications").insert({ profile_id: user.id, email: profile.recovery_email, token_hash: hashOpaqueToken(token), expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString() });
    if (error) throw error;
    const link = `${getPublicAppUrl()}/verify-recovery-email?token=${encodeURIComponent(token)}`;
    await sendAccountEmail({ to: profile.recovery_email, subject: "Verifica tu correo de recuperación", text: `Confirma este correo: ${link}`, html: `<p><a href="${link}">Verificar correo</a></p>` });
    return Response.json({ success: true });
  } catch (error) { return Response.json({ message: error instanceof Error ? error.message : "No fue posible reenviar la verificación." }, { status: 400 }); }
}
