import { createClient } from "@/lib/supabase/client";

import { User } from "../types/user";
export async function getUsers(): Promise<User[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from("profiles")

    .select(`
      id,
      email,
      company_id,
      role,
      full_name,
      phone,
      active,
      created_at,

      company:companies(
        id,
        name
      )
    `);

  if (error) {
    throw error;
  }

 return (data ?? []).map(
  (row) => ({
    ...row,

    company:
      Array.isArray(
        row.company,
      )
        ? row.company[0] ?? null
        : row.company,
  }),
) as User[];

}