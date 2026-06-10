import { createClient } from "@/lib/supabase/client";

import type {
  Canton,
} from "../types/canton";

export async function getCantons(
  provinceId: number,
): Promise<
  Canton[]
> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "cantons",
    )

    .select("*")

    .eq(
      "province_id",
      provinceId,
    )

    .order(
      "id",
    );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as Canton[];

}