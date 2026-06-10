import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getDefaultRolePermissions } from "@/modules/users/utils/get-default-role-permissions";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          message: "No autorizado",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: profile,

      error: profileError,
    } = await supabase

      .from("profiles")

      .select(
        `
          role
        `,
      )

      .eq("id", user.id)

      .single();

    if (profileError || !profile) {
      return Response.json(
        {
          message: "Perfil no encontrado",
        },
        {
          status: 403,
        },
      );
    }

    if (profile.role !== "super_admin") {
      return Response.json(
        {
          message: "Permisos insuficientes",
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const {
      email,

      full_name,

      phone,

      role,

      company_id,

      can_deliver,
    } = body;

    if (!email || !full_name || !role) {
      return Response.json(
        {
          message: "Datos incompletos",
        },
        {
          status: 400,
        },
      );
    }

    const tempPassword = Math.random().toString(36).slice(-12);
    /* ==================================
   VALIDAR MENSAJEROS
================================== */

    /* ==================================
   VALIDAR ROLES EXCLUSIVOS
   DE EMPRESA DEL SISTEMA
================================== */

    if (role === "courier" || role === "super_admin") {
      const { data: company, error: companyError } = await supabaseAdmin

        .from("companies")

        .select(
          `
      is_system_company
    `,
        )

        .eq("id", company_id)

        .single();

      if (companyError || !company) {
        return Response.json(
          {
            message: "Empresa no encontrada",
          },
          {
            status: 400,
          },
        );
      }

      if (!company.is_system_company) {
        return Response.json(
          {
            message:
              role === "super_admin"
                ? "Los administradores logísticos solo pueden pertenecer a la empresa del sistema."
                : "Los mensajeros solo pueden pertenecer a la empresa del sistema.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const {
      data: authUser,

      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,

      email_confirm: true,

      password: tempPassword,
    });

    if (authError) {
      return Response.json(
        {
          message: authError.message,
        },
        {
          status: 400,
        },
      );
    }

    const { error: insertError } = await supabaseAdmin

      .from("profiles")

      .insert({
        id: authUser.user.id,

        email,

        company_id,

        role,

        full_name,

        phone,

        active: true,

        can_deliver: can_deliver ?? role === "courier",

        must_change_password: true,

        last_password: tempPassword,
      });

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

      return Response.json(
        {
          message: insertError.message,
        },
        {
          status: 400,
        },
      );
    }

    const permissions = getDefaultRolePermissions(role);

    if (permissions.length > 0) {
      const profilePermissions = permissions.map((permissionId) => ({
        profile_id: authUser.user.id,

        permission_id: permissionId,
      }));

      const { error: permissionsError } = await supabaseAdmin

        .from("profile_permissions")

        .insert(profilePermissions);

      if (permissionsError) {
        await supabaseAdmin

          .from("profiles")

          .delete()

          .eq("id", authUser.user.id);

        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

        return Response.json(
          {
            message: permissionsError.message,
          },
          {
            status: 400,
          },
        );
      }
    }

    if (role === "courier" || can_deliver === true) {
      const { error: courierError } = await supabaseAdmin

        .from("couriers")

        .insert({
          profile_id: authUser.user.id,

          active: true,
        });

      if (courierError) {
        await supabaseAdmin

          .from("profiles")

          .delete()

          .eq("id", authUser.user.id);

        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

        return Response.json(
          {
            message: courierError.message,
          },
          {
            status: 400,
          },
        );
      }
    }
    await supabaseAdmin

      .from("password_resets")

      .insert({
        profile_id: authUser.user.id,

        temporary_password: tempPassword,

        created_by: user.id,
      });
    return Response.json({
      success: true,

      id: authUser.user.id,

      temporaryPassword: tempPassword,
    });
  } catch (error) {
    return Response.json(
      {
        message: String(error),
      },
      {
        status: 500,
      },
    );
  }
}
