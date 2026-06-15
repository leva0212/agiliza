import { createClient } from "@/lib/supabase/client";

export async function getCourierIdByProfileId(
  profileId: string,
): Promise<string | null> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "couriers",
    )

    .select(
      "id",
    )

    .eq(
      "profile_id",
      profileId,
    )

    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;

}

