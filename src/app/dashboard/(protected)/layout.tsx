import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "../components/dashboard-shell";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,

    error,
  } = await supabase

    .from("profiles")

    .select(
      `
  id,
  company_id,
  role,
  full_name,
  active,
  must_change_password,
  company:companies(
    is_owner_company
  )
`,
    )

    .eq("id", user.id)

    .single();

  if (error || !profile) {
    redirect("/login");
  }

  if (!profile.active) {
    await supabase.auth.signOut();

    redirect("/login");
  }

  if (profile.must_change_password) {
    redirect("/dashboard/change-password");
  }

  const company = Array.isArray(profile.company)
    ? profile.company[0] ?? null
    : profile.company;
  const isOwnerCompanyUser = company?.is_owner_company === true;

  return (
    <DashboardShell
      profile={{
        ...profile,
        is_owner_company_user: isOwnerCompanyUser,
      }}
      contentClassName="p-3 sm:p-6"
    >
      {children}
    </DashboardShell>
  );
}
