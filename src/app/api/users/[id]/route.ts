import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUsername, normalizeUsername } from "@/modules/auth/identity";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await createClient(); const { data: { user } } = await session.auth.getUser();
    if (!user) return Response.json({ message: "No autorizado" }, { status: 401 });
    const { data: actor } = await supabaseAdmin.from("profiles").select("role,active,company:companies(is_owner_company,is_system_company)").eq("id", user.id).maybeSingle();
    const company = Array.isArray(actor?.company) ? actor?.company[0] : actor?.company;
    if (actor?.role !== "super_admin" || !actor?.active || (!company?.is_owner_company && !company?.is_system_company)) return Response.json({ message: "Solo personal administrativo de Agiliza puede modificar usuarios." }, { status: 403 });
    const { id } = await params; const body = await request.json(); const username = typeof body.username === "string" ? normalizeUsername(body.username) : undefined;
    if (username !== undefined && !isValidUsername(username)) return Response.json({ message: "El usuario debe tener entre 3 y 32 caracteres válidos." }, { status: 400 });
    if (username) { const { data: other } = await supabaseAdmin.from("profiles").select("id").eq("username", username).neq("id", id).maybeSingle(); if (other) return Response.json({ message: "Ese usuario ya está en uso." }, { status: 400 }); }
    const { data: targetCompany, error: companyError } = await supabaseAdmin.from("companies").select("is_owner_company,is_system_company").eq("id", body.company_id).single();
    if (companyError || !targetCompany) return Response.json({ message: "Empresa no encontrada." }, { status: 400 });
    const targetIsOwnerCompany = targetCompany.is_owner_company === true || targetCompany.is_system_company === true;
    if (!targetIsOwnerCompany && body.can_deliver === true) return Response.json({ message: "Los usuarios de empresas DTS no pueden realizar entregas." }, { status: 400 });
    if (!targetIsOwnerCompany && ["courier", "super_admin"].includes(body.role)) return Response.json({ message: "Ese rol es exclusivo de la empresa propietaria." }, { status: 400 });
    const canDeliver = targetIsOwnerCompany && body.can_deliver === true;
    const update = { company_id: body.company_id, full_name: body.full_name, phone: body.phone, role: body.role, active: body.active, can_deliver: canDeliver, delivery_pay: body.delivery_pay, failed_pay: body.failed_pay, ...(username !== undefined ? { username } : {}) };
    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", id); if (error) return Response.json({ message: error.message }, { status: 400 });
    const { data: courier } = await supabaseAdmin.from("couriers").select("id").eq("profile_id", id).maybeSingle();
    if (canDeliver || courier) await supabaseAdmin.from("couriers").upsert({ profile_id:id, active: body.active === true && canDeliver }, { onConflict:"profile_id" });
    return Response.json({ success:true });
  } catch { return Response.json({ message:"No fue posible actualizar el usuario." }, { status:500 }); }
}
