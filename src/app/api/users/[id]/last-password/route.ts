import { createClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params,
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

  const { id } =
    await params;

  const {
    data,
    error,
  } =
    await supabaseAdmin

      .from(
        "password_resets",
      )

      .select(`
        temporary_password,
        created_at
      `)

      .eq(
        "profile_id",
        id,
      )

      .order(
        "created_at",
        {
          ascending: false,
        },
      )

      .limit(1)

      .maybeSingle();

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

  return Response.json({

    temporaryPassword:
      data
        ?.temporary_password ??
      null,

    createdAt:
      data
        ?.created_at ??
      null,

  });

}