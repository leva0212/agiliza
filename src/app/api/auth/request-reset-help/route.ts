import { NextRequest } from "next/server";

import { consumeRateLimit, notifyPasswordManagers, resolveProfileIdentifier } from "@/modules/auth/server/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MESSAGE = "Si la cuenta existe, la solicitud fue enviada al equipo autorizado de Agiliza.";

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();
    if (typeof identifier !== "string" || !identifier.trim()) return Response.json({ message: MESSAGE });
    if (!(await consumeRateLimit("reset_help", identifier, 3, 60))) return Response.json({ message: MESSAGE });
    const profile = await resolveProfileIdentifier(identifier);
    if (!profile?.active) return Response.json({ message: MESSAGE });

    const { data: existing } = await supabaseAdmin.from("password_reset_requests")
      .select("id").eq("profile_id", profile.id).eq("status", "pending").maybeSingle();
    if (!existing) {
      const { error } = await supabaseAdmin.from("password_reset_requests").insert({ profile_id: profile.id });
      if (error) throw error;
      await notifyPasswordManagers(
        "Solicitud de restablecimiento",
        `${profile.full_name ?? "Usuario"}${profile.username ? ` (${profile.username})` : ""} solicitó ayuda para recuperar su contraseña.`,
        { profile_id: profile.id, company_id: profile.company_id },
      );
    }
  } catch {
    // Same response prevents identifier enumeration.
  }
  return Response.json({ message: MESSAGE });
}
