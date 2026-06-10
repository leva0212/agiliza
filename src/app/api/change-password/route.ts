import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
) {

  try {

    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {

      return Response.json(
        {
          message:
            "No autorizado",
        },
        {
          status: 401,
        },
      );

    }

    const {
      password,
    } =
      await request.json();

    const {
      error,
    } =
      await supabaseAdmin

        .auth

        .admin

        .updateUserById(

          user.id,

          {
            password,
          },

        );

    if (error) {

      return Response.json(
        {
          message:
            error.message,
        },
        {
          status: 400,
        },
      );

    }

    await supabaseAdmin

      .from("profiles")

      .update({

        must_change_password:
          false,

      })

      .eq(
        "id",
        user.id,
      );

    return Response.json({

      success: true,

    });

  } catch (
    error
  ) {

    return Response.json(
      {
        message:
          String(error),
      },
      {
        status: 500,
      },
    );

  }

}