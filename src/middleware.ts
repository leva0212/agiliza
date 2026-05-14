import {

  NextRequest,

  NextResponse,

} from "next/server";

export function middleware(

  request: NextRequest

) {

  const pathname =
    request.nextUrl.pathname;

  // coverage es pública

  if (

    pathname.startsWith(

      "/dashboard/coverage"

    )

  ) {

    return NextResponse.next();

  }

  // cualquier otra ruta dashboard requiere sesión

  if (

    pathname.startsWith(

      "/dashboard"

    )

  ) {

    const role =
      request.cookies.get(
        "role"
      )?.value;

    if (
      !role
    ) {

      return NextResponse.redirect(

        new URL(

          "/login",

          request.url

        )

      );

    }

  }

  return NextResponse.next();

}

export const config = {

  matcher: [

    "/dashboard/:path*",

  ],

};