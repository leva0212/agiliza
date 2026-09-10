import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "../components/dashboard-sidebar";

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
    return children;
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
    return children;
  }

  const company = Array.isArray(profile.company)
    ? profile.company[0] ?? null
    : profile.company;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        profile={{
          ...profile,
          is_owner_company_user: company?.is_owner_company === true,
        }}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
