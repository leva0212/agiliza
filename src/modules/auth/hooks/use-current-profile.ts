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

  return {

    ...data,

    company,

    is_owner_company_user:

      company
        ?.is_owner_company ===
      true,

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