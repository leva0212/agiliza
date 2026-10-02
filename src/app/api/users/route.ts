import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPasswordValidationMessage, isEmailIdentifier, isValidUsername, normalizeEmail, normalizeUsername, usernameToInternalEmail } from "@/modules/auth/identity";
import { getDefaultRolePermissions } from "@/modules/users/utils/get-default-role-permissions";

const ROLES = new Set(["super_admin", "company_admin", "courier", "seller"]);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ message: "No autorizado" }, { status: 401 });

    const { data: actor } = await supabase.from("profiles")
      .select("role,company:companies(is_owner_company,is_system_company)").eq("id", user.id).maybeSingle();
    const actorCompany = Array.isArray(actor?.company) ? actor?.company[0] : actor?.company;
    if (actor?.role !== "super_admin" || (!actorCompany?.is_owner_company && !actorCompany?.is_system_company)) {
      return Response.json({ message: "Permisos insuficientes" }, { status: 403 });
    }

    const body = await request.json();
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const username = typeof body.username === "string" ? normalizeUsername(body.username) : "";
    const recoveryEmail = typeof body.recovery_email === "string" && body.recovery_email.trim() ? normalizeEmail(body.recovery_email) : null;
    const password = typeof body.temporary_password === "string" ? body.temporary_password : "";
    const companyId = typeof body.company_id === "string" ? body.company_id : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!fullName || !companyId || !ROLES.has(role) || !isValidUsername(username)) {
      return Response.json({ message: "Completa nombre, usuario válido, empresa y rol." }, { status: 400 });
    }
    const passwordError = getPasswordValidationMessage(password);
    if (passwordError) {
      return Response.json({ message: passwordError }, { status: 400 });
    }
    if (recoveryEmail && !isEmailIdentifier(recoveryEmail)) {
      return Response.json({ message: "El correo de recuperación no es válido." }, { status: 400 });
    }

    const { data: company, error: companyError } = await supabaseAdmin.from("companies")
      .select("is_owner_company,is_system_company").eq("id", companyId).single();
    if (companyError || !company) return Response.json({ message: "Empresa no encontrada" }, { status: 400 });
    if ((role === "courier" || role === "super_admin") && !company.is_system_company && !company.is_owner_company) {
      return Response.json({ message: role === "courier" ? "Los mensajeros solo pueden pertenecer a la empresa propietaria." : "El personal administrativo solo puede pertenecer a la empresa propietaria." }, { status: 400 });
    }
    const isOwnerCompanyUser = company.is_system_company === true || company.is_owner_company === true;
    if (!isOwnerCompanyUser && body.can_deliver === true) {
      return Response.json({ message: "Los usuarios de empresas DTS no pueden realizar entregas." }, { status: 400 });
    }
    const canDeliver = isOwnerCompanyUser && (body.can_deliver === true || role === "courier");

    const { data: duplicate } = await supabaseAdmin.from("profiles").select("id").eq("username", username).maybeSingle();
    if (duplicate) return Response.json({ message: "Ese usuario ya está en uso." }, { status: 400 });
    if (recoveryEmail) {
      const { data: emailDuplicate } = await supabaseAdmin.from("profiles").select("id").eq("recovery_email", recoveryEmail).maybeSingle();
      if (emailDuplicate) return Response.json({ message: "Ese correo ya está vinculado a otra cuenta." }, { status: 400 });
    }

    const authEmail = usernameToInternalEmail(username);
    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({ email: authEmail, email_confirm: true, password });
    if (authError || !authResult.user) return Response.json({ message: "No fue posible crear la cuenta." }, { status: 400 });

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authResult.user.id, email: authEmail, username, recovery_email: recoveryEmail,
      recovery_email_verified_at: null, company_id: companyId, role, full_name: fullName,
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      active: true, can_deliver: canDeliver, must_change_password: true,
      delivery_pay: Number(body.delivery_pay) || 0, failed_pay: Number(body.failed_pay) || 0,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authResult.user.id);
      return Response.json({ message: profileError.message }, { status: 400 });
    }

    const permissionIds = getDefaultRolePermissions(role);
    if (permissionIds.length) {
      const { error } = await supabaseAdmin.from("profile_permissions").insert(permissionIds.map((permission_id) => ({ profile_id: authResult.user.id, permission_id })));
      if (error) return Response.json({ message: "La cuenta fue creada, pero no se pudieron asignar sus permisos." }, { status: 400 });
    }
    if (canDeliver) await supabaseAdmin.from("couriers").insert({ profile_id: authResult.user.id, active: true });
    return Response.json({ success: true, id: authResult.user.id });
  } catch {
    return Response.json({ message: "No fue posible crear el usuario." }, { status: 500 });
  }
}
