import {
  NextRequest,
  NextResponse,
} from "next/server";

export function proxy(
  request: NextRequest
) {

  const role =
    request.cookies.get(
      "role"
    )?.value;

  const pathname =
    request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith(
      "/dashboard/routes"
    );

  if (
    isProtectedRoute &&
    role !== "admin"
  ) {

    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );

  }

  return NextResponse.next();

}

export const config = {

  matcher: [
    "/dashboard/:path*",
  ],

};