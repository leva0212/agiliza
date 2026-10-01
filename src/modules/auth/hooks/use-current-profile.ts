"use client";

import { useQuery } from "@tanstack/react-query";

import {
  createClient,
} from "@/lib/supabase/client";

export async function getCurrentProfile() {

  const supabase =
    createClient();

  const {
    data: authData,

    error: authError,

  } = await supabase.auth.getUser();

  if (authError) {

    throw authError;

  }

  if (!authData.user) {

    return null;

  }

  const {
    data,

    error,

  } = await supabase

    .from(
      "profiles",
    )

    .select(`
      id,
      company_id,
      role,
      full_name,
      phone,
      active,

      company:companies(
        id,
        code,
        name,
        is_owner_company
      )
    `)

    .eq(
      "id",
      authData.user.id,
    )

    .single();

  if (error) {

    throw error;

  }

  const company =

    Array.isArray(
      data.company,
    )

      ? data.company[0] ??
        null

      : data.company;

  const { data: companyContextData } = await supabase
    .rpc("get_current_company_context")
    .maybeSingle();
  const companyContext = companyContextData as { company_id: string; code: string; is_owner_company: boolean } | null;

  const visibleCompany = company ?? (companyContext ? {
    id: companyContext.company_id,
    code: companyContext.code,
    name: null,
    is_owner_company: companyContext.is_owner_company,
  } : null);

  const { data: systemSettings } = await supabase
    .from("system_settings")
    .select("dts_chat_enabled,restricted_supervisor_mode")
    .eq("id", true)
    .maybeSingle();

  return {

    ...data,

    company: visibleCompany,

    is_owner_company_user:

      visibleCompany
        ?.is_owner_company ===
      true,
    dts_chat_enabled: systemSettings?.dts_chat_enabled ?? false,
    restricted_supervisor_mode: systemSettings?.restricted_supervisor_mode ?? false,

  };

}

export function useCurrentProfile() {

  return useQuery({

    queryKey: [
      "current-profile",
    ],

    queryFn:
      getCurrentProfile,

    staleTime:
      1000 * 60 * 5,

  });

}
