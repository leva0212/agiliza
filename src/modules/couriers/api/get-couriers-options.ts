import { createClient } from "@/lib/supabase/client";

export async function getCouriersOptions() {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from("couriers")

    .select(`
      id,
      profile:profiles(
        full_name
      )
    `)

    .eq(
      "active",
      true,
    )

    .order(
      "created_at",
    );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (courier: any) => ({

      id:
        courier.id,

      name:
        courier.profile
          ?.full_name ??
        "Sin nombre",

    }),
  );

}