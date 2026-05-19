import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

export async function POST(
  request: Request
) {

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {

    return NextResponse.json(
      {
        success: false,
        message:
          "Variables de entorno faltantes",
      },
      {
        status: 500,
      }
    );

  }

  const supabase =
    createClient(
      supabaseUrl,
      supabaseKey
    );

  const {
    email,
    password,
  } = await request.json();

  const {
    data: user,
  } = await supabase
    .from(
      "admin_users"
    )
    .select("*")
    .eq(
      "email",
      email
    )
    .eq(
      "active",
      true
    )
    .maybeSingle();

  if (
    !user
  ) {

    return NextResponse.json({

      success:
        false,

      message:
        "Usuario no existe",

    });

  }

  if (
    user.password !==
    password
  ) {

    return NextResponse.json({

      success:
        false,

      message:
        "Contraseña incorrecta",

    });

  }

  const cookieStore =
    await cookies();
    cookieStore.set(

  "role",

  "admin",

  {

    httpOnly:
      true,

    path:
      "/",

    secure:
      true,

    sameSite:
      "lax",

  }

);

  /*cookieStore.set(

    "role",

    "admin",

    {

      httpOnly:
        true,

      path:
        "/",

      secure:
        true,

      sameSite:
        "lax",

    }

  );*/

  return NextResponse.json({

    success:
      true,

  });

}