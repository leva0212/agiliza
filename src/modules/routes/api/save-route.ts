import { createClient } from "@/lib/supabase/client";

type Params = {
  routeId?: string | null;

  routeName: string;

  selectedNeighborhoods: number[];

  districtDeliveryTimes?: {
    district_id: number;
    min_hours: number;
    max_hours: number;
  }[];

  districtVisitDays?: {
    district_id: number;
    days: string[];
  }[];

  company_delivery_charge: number;
  courier_delivery_pay: number;
  company_failed_charge: number;
  courier_failed_pay: number;

  // mantener porque protege la cobertura
  loadedDistrictIds:number[];
};

export async function saveRoute({

  routeId,
  routeName,
  selectedNeighborhoods,

  company_delivery_charge,
  courier_delivery_pay,
  company_failed_charge,
  courier_failed_pay,

  districtDeliveryTimes=[],
  districtVisitDays=[],

  loadedDistrictIds,

}:Params){
  const supabase = createClient();

  let currentRouteId=routeId;

  // =====================================================
  // EDITAR
  // =====================================================

  if(routeId){

    const {error}=await supabase
    .from("routes")
    .update({

      name:routeName,

      company_delivery_charge,
      courier_delivery_pay,
      company_failed_charge,
      courier_failed_pay,

    })
    .eq(
      "id",
      routeId
    );

    if(error) throw error;

    // =====================================================
    // COBERTURA
    // Mantener lógica original
    // =====================================================

    if(loadedDistrictIds.length>0){

      const {
        data:loadedNeighborhoods
      }=await supabase
      .from("neighborhoods")
      .select(
        "id,district_id"
      )
      .in(
        "district_id",
        loadedDistrictIds
      );

      const loadedNeighborhoodIds=
      new Set(

        loadedNeighborhoods?.map(
          x=>Number(
            x.id
          )
        ) ?? []

      );

      const {
        data:existingCoverage
      }=await supabase
      .from(
        "route_coverage"
      )
      .select(
        "neighborhood_id"
      )
      .eq(
        "route_id",
        routeId
      )
      .in(
        "neighborhood_id",
        [...loadedNeighborhoodIds]
      );

      const existingIds=
      new Set(

        existingCoverage?.map(
          x=>Number(
            x.neighborhood_id
          )
        ) ?? []

      );

      const incomingIds=
      new Set(

        selectedNeighborhoods.filter(
          id=>
          loadedNeighborhoodIds.has(
            id
          )
        )

      );

      const toDelete=
      [...existingIds].filter(
        id=>
        !incomingIds.has(
          id
        )
      );

      const toInsert=
      [...incomingIds].filter(
        id=>
        !existingIds.has(
          id
        )
      );

      if(toDelete.length){

        const {error}=await supabase
        .from(
          "route_coverage"
        )
        .delete()
        .eq(
          "route_id",
          routeId
        )
        .in(
          "neighborhood_id",
          toDelete
        );

        if(error)
        throw error;

      }

      if(toInsert.length){

        const {error}=await supabase
        .from(
          "route_coverage"
        )
        .insert(

          toInsert.map(
            neighborhoodId=>({

              route_id:
              routeId,

              neighborhood_id:
              neighborhoodId

            })
          )

        );

        if(error)
        throw error;

      }

    }

    // =====================================================
    // HORAS DISTRITO
    // =====================================================

    await supabase
    .from(
      "route_district_delivery_times"
    )
    .delete()
    .eq(
      "route_id",
      routeId
    );

    // =====================================================
    // DIAS DISTRITO
    // =====================================================

    await supabase
    .from(
      "route_district_visit_days"
    )
    .delete()
    .eq(
      "route_id",
      routeId
    );

  }

  // =====================================================
  // CREAR
  // =====================================================

  else{

    const {
      data,
      error
    }=await supabase
    .from(
      "routes"
    )
    .insert({

      name:routeName,

      company_delivery_charge,
      courier_delivery_pay,
      company_failed_charge,
      courier_failed_pay,

    })
    .select()
    .single();

    if(error)
    throw error;

    currentRouteId=data.id;

    if(
      selectedNeighborhoods.length
    ){

      const {error}=await supabase
      .from(
        "route_coverage"
      )
      .insert(

        selectedNeighborhoods
.filter(
id=>

typeof id==="number"
&&
!isNaN(id)
&&
id>0
)
.map(
neighborhoodId=>({

            route_id:
            currentRouteId,

            neighborhood_id:
            neighborhoodId

          })
        )

      );

      if(error)
      throw error;

    }

  }

  // =====================================================
  // HORAS POR DISTRITO
  // =====================================================

  if(
    districtDeliveryTimes.length
  ){

    const {error}=await supabase
    .from(
      "route_district_delivery_times"
    )
    .insert(

      districtDeliveryTimes.map(
        item=>({

          route_id:
          currentRouteId,

          district_id:
          item.district_id,

          min_hours:
          item.min_hours,

          max_hours:
          item.max_hours

        })
      )

    );

    if(error)
    throw error;

  }

  // =====================================================
  // DIAS POR DISTRITO
  // =====================================================

  const districtDaysPayload=

  districtVisitDays.flatMap(
    district=>

      district.days.map(
        day=>({

          route_id:
          currentRouteId,

          district_id:
          district.district_id,

          day

        })
      )

  );

  if(
    districtDaysPayload.length
  ){

    const {error}=await supabase
    .from(
      "route_district_visit_days"
    )
    .insert(
      districtDaysPayload
    );

    if(error)
    throw error;

  }

  return currentRouteId;

}