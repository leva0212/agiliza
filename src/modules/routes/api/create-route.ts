import { supabase } from "@/services/supabase/client";

type Input = {
  name: string;
  estimatedHours: number;
};

export async function createRoute(
  input: Input
) {
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

  if (error) throw error;

  return data;
}