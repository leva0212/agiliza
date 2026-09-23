import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,

  { params }: Params,
) {
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

    const { data: actor, error: actorError } = await supabaseAdmin
      .from("profiles").select("role, active").eq("id", user.id).single();
    if (actorError || actor?.active !== true || actor.role !== "super_admin") {
      return Response.json({ message: "Solo un administrador activo puede modificar usuarios." }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    const {
      company_id,

      full_name,

      phone,

      role,

      active,

      can_deliver,

      delivery_pay,

      failed_pay,
    } = body;

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

    const { error } = await supabaseAdmin

      .from("profiles")

      .update({
        company_id,

        full_name,

        phone,

        role,

        active,

        can_deliver,

        delivery_pay,

        failed_pay,
      })

      .eq("id", id);

    if (error) {
      return Response.json(
        {
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }
    // Un perfil tiene un único registro courier; desactivar conserva sus vínculos.
    const { data: courier, error: courierLookupError } = await supabaseAdmin
      .from("couriers").select("id").eq("profile_id", id).maybeSingle();
    if (courierLookupError) throw courierLookupError;
    if (can_deliver || courier) {
      const { error: courierError } = await supabaseAdmin.from("couriers").upsert({
        profile_id: id,
        active: active === true && can_deliver === true,
      }, { onConflict: "profile_id" });
      if (courierError) throw courierError;
    }

    return Response.json({
      success: true,
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
