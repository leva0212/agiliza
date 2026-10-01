import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("company:companies(is_owner_company)").eq("id", user.id).single(),
    supabase.from("system_settings").select("dts_chat_enabled").eq("id", true).maybeSingle(),
  ]);
  const company = Array.isArray(profile?.company) ? profile.company[0] : profile?.company;
  if (company?.is_owner_company !== true && settings?.dts_chat_enabled !== true) redirect("/dashboard/tracking");
  return children;
}
