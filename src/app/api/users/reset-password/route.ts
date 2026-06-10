import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
) {

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
    profileId,
  } =
    await request.json();

  const newPassword =
    Math.random()
      .toString(36)
      .slice(-12);

  const {
    error,
  } =
    await supabaseAdmin

      .auth

      .admin

      .updateUserById(

        profileId,

        {
          password:
            newPassword,
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
        true,

    })

    .eq(
      "id",
      profileId,
    );

  await supabaseAdmin

    .from(
      "password_resets",
    )

    .insert({

      profile_id:
        profileId,

      temporary_password:
        newPassword,

      created_by:
        user.id,

    });

  return Response.json({

    success: true,

    temporaryPassword:
      newPassword,

  });

}