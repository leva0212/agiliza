import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function FinancialReportsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("active, role, company:companies(is_owner_company, is_system_company)")
    .eq("id", user.id)
    .single();
  const company = Array.isArray(profile?.company) ? profile.company[0] : profile?.company;
  const isEps = company?.is_owner_company === true || company?.is_system_company === true;
  const canView = profile?.active && isEps && ["super_admin", "company_admin"].includes(profile.role);
  if (!canView) redirect("/dashboard");

  return children;
}
