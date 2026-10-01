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
    code,
    name,
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
  const { data: companyContextData } = await supabase
    .rpc("get_current_company_context")
    .maybeSingle();
  const companyContext = companyContextData as { code: string } | null;
  const companyLabel = profile.role === "courier"
    ? companyContext?.code ?? null
    : company?.name ?? companyContext?.code ?? null;
  const { data: systemSettings } = await supabase
    .from("system_settings")
    .select("dts_chat_enabled,restricted_supervisor_mode")
    .eq("id", true)
    .maybeSingle();

  return (
    <DashboardShell
      profile={{
        ...profile,
        is_owner_company_user: isOwnerCompanyUser,
        dts_chat_enabled: systemSettings?.dts_chat_enabled ?? false,
        restricted_supervisor_mode: systemSettings?.restricted_supervisor_mode ?? false,
        company_label: companyLabel,
      }}
      contentClassName="p-3 sm:p-6"
    >
      {children}
    </DashboardShell>
  );
}
