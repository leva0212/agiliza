import { NextRequest } from "next/server";

import { getPasswordValidationMessage } from "@/modules/auth/identity";
import { hashOpaqueToken } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();
    if (typeof token !== "string" || typeof password !== "string" || password !== confirmPassword) {
      return Response.json({ message: "Verifica la nueva contraseña y su confirmación." }, { status: 400 });
    }
    const passwordError = getPasswordValidationMessage(password);
    if (passwordError) return Response.json({ message: passwordError }, { status: 400 });

    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("account_password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token_hash", hashOpaqueToken(token))
      .is("used_at", null).is("invalidated_at", null).gt("expires_at", new Date().toISOString())
      .select("profile_id").maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return Response.json({ message: "El enlace ya no es válido. Solicita uno nuevo." }, { status: 400 });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(claimed.profile_id, { password });
    if (error) throw error;
    await supabaseAdmin.from("profiles").update({ must_change_password: false }).eq("id", claimed.profile_id);
    return Response.json({ success: true });
  } catch {
    return Response.json({ message: "No fue posible restablecer la contraseña." }, { status: 400 });
  }
}
