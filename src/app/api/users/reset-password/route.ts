import { NextRequest } from "next/server";

import { getPasswordValidationMessage } from "@/modules/auth/identity";
import { getAuthorizedPasswordManager } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const actor = await getAuthorizedPasswordManager();
  if (!actor) return Response.json({ message: "No tienes autorización para restablecer contraseñas." }, { status: 403 });
  try {
    const { profileId, temporaryPassword, requestId } = await request.json();
    if (typeof profileId !== "string" || typeof temporaryPassword !== "string") {
      return Response.json({ message: "La contraseña temporal no es válida." }, { status: 400 });
    }
    const passwordError = getPasswordValidationMessage(temporaryPassword);
    if (passwordError) return Response.json({ message: passwordError }, { status: 400 });
    const { error } = await supabaseAdmin.auth.admin.updateUserById(profileId, { password: temporaryPassword });
    if (error) throw error;
    await supabaseAdmin.from("profiles").update({ must_change_password: true }).eq("id", profileId);
    if (typeof requestId === "string") {
      await supabaseAdmin.from("password_reset_requests").update({ status: "approved", resolved_by: actor.userId, resolved_at: new Date().toISOString() }).eq("id", requestId).eq("status", "pending");
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ message: "No fue posible restablecer la contraseña." }, { status: 400 });
  }
}
