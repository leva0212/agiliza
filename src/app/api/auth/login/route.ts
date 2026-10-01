import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { resolveProfileIdentifier } from "@/modules/auth/server/security";

const FAILURE_MESSAGE = "No fue posible iniciar sesión con esos datos.";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: false, message: FAILURE_MESSAGE }, { status: 401 });
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!identifier.trim() || !password) return response;

    const profile = await resolveProfileIdentifier(identifier);
    if (!profile?.active || !profile.email) return response;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      },
    );
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: profile.email, password });
    if (error || !signInData.session) return response;
    // The SSR cookie is the server source of truth. Returning the session also
    // lets the browser client hydrate immediately before navigating.
    const success = NextResponse.json({
      success: true,
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      },
    });
    response.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
    return success;
  } catch {
    return response;
  }
}
