import { supabase } from "@/services/supabase/client";

export async function getProvinceCoverageCounts(

  provinceName: string

) {

  const {
    data,

    error,
  } = await supabase.rpc(

    "get_province_coverage_counts",

    {

      p_province:
        provinceName,

    }

  );

  if (
    error
  ) {
    throw error;
  }

  return (
    data || []
  );

}