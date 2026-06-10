import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getRoleLabel } from "@/modules/users/utils/get-role-label";

import { RealtimeClock } from "@/modules/dashboard/components/realtime-clock";

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase

    .from("profiles")

    .select(
      `
        id,
        company_id,
        role,
        full_name,
        active,

        company:companies(
          id,
          name
        )
      `,
    )

    .eq("id", user.id)

    .single();

  return (
    <>
      <div className="space-y-2">
        <div>
          <span className="font-bold">Empresa:</span> <span>{
          Array.isArray(
            profile?.company,
          )

            ? profile.company[0]
                ?.name

            : (
                profile as any
              )?.company?.name
        }</span>
        </div>

        <div>
          <span className="font-bold">Usuario:</span>{" "}
          <span>{profile?.full_name}</span>
        </div>

        <div>
          <span className="font-bold">Rol:</span>{" "}
          <span>{getRoleLabel(profile?.role ?? "")}</span>
        </div>
      </div>
      <RealtimeClock />
    </>
  );
}
