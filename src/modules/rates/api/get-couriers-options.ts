import { createClient } from "@/lib/supabase/client";

export type CourierOption = {
  id: string;

  full_name: string;
};

export async function getCouriersOptions(): Promise<
  CourierOption[]
> {
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

  return (data ?? []).map(
    (courier: any) => ({
      id: courier.id,

      full_name:
        Array.isArray(
          courier.profile,
        )
          ? courier.profile[0]
              ?.full_name ?? ""
          : courier.profile
              ?.full_name ?? "",
    }),
  );
}