import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPasswordValidationMessage } from "@/modules/auth/identity";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  let passwordWasUpdated = false;
  try {
    // Route Handlers receive the request cookies directly. Using this adapter also
    // preserves refreshed Supabase session cookies in the API response.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }),
        },
      },
    );
    const authorization = request.headers.get("authorization");
    const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    // Validate the cookie session first: getUser can refresh an expired token.
    // A stale browser Authorization header must not shadow a valid cookie session.
    const cookieAuth = await supabase.auth.getUser();
    let user = cookieAuth.data.user;
    let sessionToken: string | undefined;
    if (user) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token;
    } else if (bearerToken) {
      const bearerAuth = await supabaseAdmin.auth.getUser(bearerToken);
      user = bearerAuth.data.user;
      if (user) sessionToken = bearerToken;
    }
    if (!user) return NextResponse.json({ message: "Tu sesión venció. Inicia sesión nuevamente con tu contraseña temporal o actual para continuar." }, { status: 401 });
    const { password, confirmPassword, currentPassword } = await request.json();
    if (typeof password !== "string" || password !== confirmPassword) return NextResponse.json({ message: "Las contraseñas no coinciden." }, { status: 400 });
    const validationMessage = getPasswordValidationMessage(password);
    if (validationMessage) return NextResponse.json({ message: validationMessage }, { status: 400 });
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles")
      .select("must_change_password").eq("id", user.id).maybeSingle();
    if (profileError || !profile) throw new Error("Perfil no encontrado.");
    // The initial forced change accepts the temporary password as the established
    // credential. Later voluntary changes always require proof of the current one.
    if (!profile.must_change_password) {
      if (typeof currentPassword !== "string" || !currentPassword) {
        return NextResponse.json({ message: "Ingresa tu contraseña actual." }, { status: 400 });
      }
      const { data: authRecord, error: authRecordError } = await supabaseAdmin.auth.admin.getUserById(user.id);
      if (authRecordError || !authRecord.user.email) throw new Error("No fue posible verificar la cuenta.");
      const { error: currentPasswordError } = await supabase.auth.signInWithPassword({ email: authRecord.user.email, password: currentPassword });
      if (currentPasswordError) return NextResponse.json({ message: "La contraseña actual no es correcta." }, { status: 400 });
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
    if (error) throw error;
    passwordWasUpdated = true;
    const { error: profileUpdateError } = await supabaseAdmin.from("profiles").update({ must_change_password: false }).eq("id", user.id);
    if (profileUpdateError) throw new Error("PASSWORD_CHANGED_PROFILE_FAILED");
    // Revoca los refresh tokens de la cuenta en todos sus dispositivos.
    // Un JWT ya emitido solo puede mantenerse válido hasta que expire.
    if (sessionToken) {
      // Best effort: updating the password already invalidates the user's Auth
      // sessions. The explicit global logout must never turn a successful
      // password change into an error response.
      await supabaseAdmin.auth.admin.signOut(sessionToken, "global");
    }
    return response;
  } catch (error) {
    if (passwordWasUpdated) {
      return Response.json({
        message: "La contraseña sí fue actualizada, pero no se pudo completar el estado de seguridad del perfil. Inicia sesión con la nueva contraseña y contacta a un administrador si vuelve a solicitar el cambio.",
      }, { status: 409 });
    }
    const status = typeof error === "object" && error && "status" in error && typeof error.status === "number" ? error.status : 400;
    const code = typeof error === "object" && error && "code" in error && typeof error.code === "string" ? error.code : "";
    const detail = error instanceof Error ? error.message.toLowerCase() : "";
    if (status === 429 || code.includes("rate_limit") || detail.includes("too many")) {
      return Response.json({ message: "Supabase limitó temporalmente los cambios de contraseña por demasiados intentos. Espera unos minutos antes de volver a intentarlo." }, { status: 429 });
    }
    if (code === "same_password" || detail.includes("same password") || detail.includes("different from the old")) {
      return Response.json({ message: "La nueva contraseña debe ser diferente de la contraseña actual." }, { status: 400 });
    }
    return Response.json({ message: "No fue posible actualizar la contraseña. Intenta con una contraseña diferente o vuelve a iniciar sesión." }, { status: 400 });
  }
}
