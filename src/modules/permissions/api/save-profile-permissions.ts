import { createClient } from "@/lib/supabase/client";

export async function saveProfilePermissions(
  profileId: string,

  permissionIds: string[],
) {

  const supabase =
    createClient();

  const {
    error:
      deleteError,
  } =
    await supabase

      .from(
        "profile_permissions",
      )

      .delete()

      .eq(
        "profile_id",
        profileId,
      );

  if (
    deleteError
  ) {
    throw deleteError;
  }

  if (
    permissionIds.length ===
    0
  ) {
    return;
  }

  const {
    error:
      insertError,
  } =
    await supabase

      .from(
        "profile_permissions",
      )

      .insert(

        permissionIds.map(
          (
            permissionId,
          ) => ({

            profile_id:
              profileId,

            permission_id:
              permissionId,

          }),
        ),

      );

  if (
    insertError
  ) {
    throw insertError;
  }

}