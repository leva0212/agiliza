import { createClient } from "@/lib/supabase/client";
import {
  createDefaultRatesForRoute,
} from "@/modules/rates/api/create-default-rates-for-route";
type Input = {
  name: string;
  estimatedHours: number;
};

export async function createRoute(
  input: Input
) {
  const supabase = createClient();
  const { data, error } =
    await supabase
      .from("routes")
      .insert({
        name: input.name,

        estimated_hours:
          input.estimatedHours,
      })
      .select()
      .single();

  if (
    error
  ) {
    throw error;
  }

  await createDefaultRatesForRoute(
    data.id,
  );

  return data;

  return data;
}