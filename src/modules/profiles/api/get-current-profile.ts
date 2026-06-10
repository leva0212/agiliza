import {
  createClient,
} from "@/lib/supabase/client";

export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: auth,
  } = await supabase.auth.getUser();

  if (!auth.user) {
    throw new Error(
      "Usuario no autenticado",
    );
  }

  const {
    data,

    error,
  } = await supabase

    .from("profiles")

    .select("*")

    .eq(
      "id",
      auth.user.id,
    )

    .single();

  if (error) {
    throw error;
  }

  return data;
}