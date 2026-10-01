import { NextRequest } from "next/server";

import { hashOpaqueToken } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (typeof token !== "string") throw new Error();
    const { data: claimed } = await supabaseAdmin.from("account_email_verifications")
      .update({ used_at: new Date().toISOString() })
      .eq("token_hash", hashOpaqueToken(token)).is("used_at", null).is("invalidated_at", null)
      .gt("expires_at", new Date().toISOString()).select("profile_id,email").maybeSingle();
    if (!claimed) throw new Error();
    const { error } = await supabaseAdmin.from("profiles")
      .update({ recovery_email_verified_at: new Date().toISOString() })
      .eq("id", claimed.profile_id).eq("recovery_email", claimed.email);
    if (error) throw error;
    return Response.json({ success: true });
  } catch {
    return Response.json({ message: "El enlace de verificación ya no es válido." }, { status: 400 });
  }
}
