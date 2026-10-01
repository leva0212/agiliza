import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ChatSettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,active,company:companies(is_owner_company,is_system_company)")
    .eq("id", user.id)
    .single();
  const company = Array.isArray(profile?.company) ? profile.company[0] : profile?.company;
  const allowedRole = profile?.role === "super_admin" || profile?.role === "company_admin";
  if (!profile?.active || !allowedRole || (!company?.is_owner_company && !company?.is_system_company)) redirect("/dashboard");
  return children;
}
