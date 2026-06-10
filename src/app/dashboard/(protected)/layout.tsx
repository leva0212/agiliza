import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "../components/dashboard-sidebar";

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
  must_change_password
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar profile={profile} />

      <main className="flex-1">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
