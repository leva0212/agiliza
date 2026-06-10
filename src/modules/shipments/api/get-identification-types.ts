import { createClient }
  from "@/lib/supabase/client";

import type {
  IdentificationType,
} from "../types/identification-type";

export async function getIdentificationTypes(): Promise<
  IdentificationType[]
> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "identification_types",
      )

      .select(`
        id,
        code,
        name,
        active,
        created_at
      `)

      .eq(
        "active",
        true,
      )

      .order(
        "name",
        {
          ascending: true,
        },
      );

  if (error) {
    throw error;
  }

  return (
    data ??
    []
  ) as IdentificationType[];
}