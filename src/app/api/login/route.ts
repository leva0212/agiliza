import {

  cookies,

} from "next/headers";

import {

  NextResponse,

} from "next/server";

import {

  createClient,

} from "@supabase/supabase-js";

const supabase =
  createClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  );

export async function POST(

  request: Request

) {

  const {

    email,

    password,

  } = await request.json();

  // buscar usuario por correo

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

  // usuario no existe

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

  // contraseña incorrecta

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

  // login exitoso

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

    }

  );

  return NextResponse.json({

    success:
      true,

    });

}