import { supabase } from "@/services/supabase/client";

export async function getDistrictNeighborhoods(

  districtId: number,

  routeId?: string | null

) {

  const {
    data,

    error,
  } = await supabase.rpc(

    "get_district_neighborhoods",

    {

      p_district_id:
        districtId,

      p_route_id:
        routeId || null,

    }

  );

  if (
    error
  ) {

    console.error(
      error
    );

    throw error;

  }

  return (
    data || []
  );

}