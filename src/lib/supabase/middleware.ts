import { createServerClient } from "@supabase/ssr";

import {
  NextResponse,

  type NextRequest,
} from "next/server";

function isExternalCompanyAllowedPath(pathname: string) {
  return [
    "/dashboard/tracking",
    "/dashboard/coverage",
    "/dashboard/change-password",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function updateSession(
  request: NextRequest,
) {

  let response =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(

      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,

      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      {

        cookies: {

          get(
            name,
          ) {

            return request.cookies.get(
              name,
            )?.value;

          },

          set(
            name,
            value,
            options,
          ) {

            request.cookies.set({

              name,

              value,

              ...options,

            });

            response =
              NextResponse.next({
                request,
              });

            response.cookies.set({

              name,

              value,

              ...options,

            });

          },

          remove(
            name,
            options,
          ) {

            request.cookies.set({

              name,

              value: "",

              ...options,

            });

            response =
              NextResponse.next({
                request,
              });

            response.cookies.set({

              name,

              value: "",

              ...options,

            });

          },

        },

      },

    );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && request.nextUrl.pathname === "/login") {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  if (
    user &&
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !isExternalCompanyAllowedPath(request.nextUrl.pathname)
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company:companies(is_owner_company)")
      .eq("id", user.id)
      .maybeSingle();
    const company = Array.isArray(profile?.company)
      ? profile.company[0] ?? null
      : profile?.company;

    if (company?.is_owner_company !== true) {
      const redirectResponse = NextResponse.redirect(
        new URL("/dashboard/tracking", request.url),
      );

      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });

      return redirectResponse;
    }
  }

  return response;

}
