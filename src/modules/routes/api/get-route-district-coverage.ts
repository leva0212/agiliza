import { createClient } from "@/lib/supabase/client";

export async function getRouteDistrictCoverage(
  routeId: string,
) {
const supabase = createClient();  
  const {
    data,

    error,
  } = await supabase.rpc(

    "get_route_district_coverage",

    {
      p_route_id:
        routeId,
    }

  );  

  if (
    error
  ) {

    console.error(
      "district coverage error:",
      error
    );

    throw error;

  }

  console.log(
    "district coverage api:",
    data
  );

  return data || [];

}