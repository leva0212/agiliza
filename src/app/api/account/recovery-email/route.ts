import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPublicAppUrl, sendAccountEmail } from "@/lib/email/server";
import { isEmailIdentifier, normalizeEmail } from "@/modules/auth/identity";
import { createOpaqueToken, hashOpaqueToken } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getCurrentProfileId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  const id = await getCurrentProfileId();
  if (!id) return Response.json({ message: "No autorizado" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("profiles")
    .select("recovery_email,recovery_email_verified_at").eq("id", id).single();
  if (error) return Response.json({ message: "No fue posible consultar el correo." }, { status: 400 });
  return Response.json({
    ...data,
    email_recovery_available: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.NEXT_PUBLIC_APP_URL),
  });
}

export async function POST(request: NextRequest) {
  const id = await getCurrentProfileId();
  if (!id) return Response.json({ message: "No autorizado" }, { status: 401 });
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !isEmailIdentifier(email)) {
      return Response.json({ message: "Ingresa un correo válido." }, { status: 400 });
    }
    const recoveryEmail = normalizeEmail(email);
    const { data: existing } = await supabaseAdmin.from("profiles").select("id")
      .eq("recovery_email", recoveryEmail).neq("id", id).maybeSingle();
    if (existing) return Response.json({ message: "Ese correo ya está vinculado a otra cuenta." }, { status: 400 });

    await supabaseAdmin.from("account_email_verifications").update({ invalidated_at: new Date().toISOString() })
      .eq("profile_id", id).is("used_at", null).is("invalidated_at", null);
    await supabaseAdmin.from("account_password_reset_tokens").update({ invalidated_at: new Date().toISOString() })
      .eq("profile_id", id).is("used_at", null).is("invalidated_at", null);
    const token = createOpaqueToken();
    const { error } = await supabaseAdmin.from("profiles").update({ recovery_email: recoveryEmail, recovery_email_verified_at: null }).eq("id", id);
    if (error) throw error;
    const { error: tokenError } = await supabaseAdmin.from("account_email_verifications").insert({
      profile_id: id, email: recoveryEmail, token_hash: hashOpaqueToken(token), expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    });
    if (tokenError) throw tokenError;
    const link = `${getPublicAppUrl()}/verify-recovery-email?token=${encodeURIComponent(token)}`;
    await sendAccountEmail({ to: recoveryEmail, subject: "Verifica tu correo de recuperación", text: `Confirma este correo: ${link}`, html: `<p>Confirma tu correo de recuperación:</p><p><a href="${link}">Verificar correo</a></p>` });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "No fue posible guardar el correo." }, { status: 400 });
  }
}

export async function DELETE() {
  const id = await getCurrentProfileId();
  if (!id) return Response.json({ message: "No autorizado" }, { status: 401 });
  await supabaseAdmin.from("account_email_verifications").update({ invalidated_at: new Date().toISOString() }).eq("profile_id", id).is("used_at", null);
  await supabaseAdmin.from("account_password_reset_tokens").update({ invalidated_at: new Date().toISOString() }).eq("profile_id", id).is("used_at", null);
  const { error } = await supabaseAdmin.from("profiles").update({ recovery_email: null, recovery_email_verified_at: null }).eq("id", id);
  if (error) return Response.json({ message: "No fue posible eliminar el correo." }, { status: 400 });
  return Response.json({ success: true });
}
