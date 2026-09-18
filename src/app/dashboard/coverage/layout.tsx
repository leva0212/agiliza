import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "../components/dashboard-shell";

type CoverageLayoutProps = {
  children: React.ReactNode;
};

export default async function CoverageLayout({
  children,
}: CoverageLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      company_id,
      role,
      full_name,
      active,
      company:companies(
        is_owner_company
      )
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  const company = Array.isArray(profile.company)
    ? profile.company[0] ?? null
    : profile.company;

  return (
    <DashboardShell
      profile={{
        ...profile,
        is_owner_company_user: company?.is_owner_company === true,
      }}
    >
      {children}
    </DashboardShell>
  );
}
