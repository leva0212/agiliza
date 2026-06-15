import { createClient } from "@/lib/supabase/client";

export async function getUser(
  id: string,
) {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from("profiles")

      .select(`
        id,
        email,
        company_id,
        role,
        full_name,
        phone,
        active,
        can_deliver,
        delivery_pay,
      failed_pay,
        must_change_password,

        company:companies(
          id,
          name
        )
      `)

      .eq(
        "id",
        id,
      )

      .single();

  if (error) {
    throw error;
  }

  return data;

}