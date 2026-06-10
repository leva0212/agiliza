import { createClient } from "@/lib/supabase/client";

export async function getProfilePermissions(
  profileId: string,
) {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "profile_permissions",
      )

      .select(`
        permission_id
      `)

      .eq(
        "profile_id",
        profileId,
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (x) =>
      x.permission_id,
  );

}