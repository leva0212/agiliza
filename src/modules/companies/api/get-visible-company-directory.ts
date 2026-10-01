import { createClient } from "@/lib/supabase/client";

export type VisibleCompany = {
  id: string;
  code: string;
  name: string | null;
  display_name: string;
};

export async function getVisibleCompanyDirectory(companyIds: string[]) {
  if (!companyIds.length) return [] as VisibleCompany[];
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_visible_company_directory", {
    p_company_ids: [...new Set(companyIds)],
  });
  if (error) throw error;
  return (data ?? []) as VisibleCompany[];
}
