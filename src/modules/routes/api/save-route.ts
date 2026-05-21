import { supabase } from "@/services/supabase/client";

type Params = {
  routeId?: string | null;
  routeName: string;
  estimatedHours: number;
  selectedDays: string[];
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
  visitedDistricts:number[];
};

export async function saveRoute({
  routeId,
  routeName,
  estimatedHours,
  selectedDays,
  selectedNeighborhoods,
  company_delivery_charge,
  courier_delivery_pay,
  company_failed_charge,
  courier_failed_pay,
  districtDeliveryTimes = [],
  districtVisitDays = [],
  visitedDistricts,
}: Params) {
  let currentRouteId = routeId;

  // ── EDITAR ────────────────────────────────────────────────────────────────
  if (routeId) {
    const { error } = await supabase
      .from("routes")
      .update({
        name: routeName,
        estimated_hours: estimatedHours,
        company_delivery_charge,
        courier_delivery_pay,
        company_failed_charge,
        courier_failed_pay,
      })
      .eq("id", routeId);

    if (error) throw error;

    // Días base: delete + re-insert
    await supabase.from("route_visit_days").delete().eq("route_id", routeId);

    // ── COBERTURA: diff solo sobre los distritos navegados ─────────────────
    const loadedDistrictIds =

visitedDistricts;

    const { data: loadedNeighborhoods } = await supabase
      .from("neighborhoods")
      .select("id, district_id")
      .in("district_id", loadedDistrictIds);

    const loadedNeighborhoodIds = new Set(
      loadedNeighborhoods?.map((x) => Number(x.id)) ?? []
    );

    const { data: existingCoverage } = await supabase
      .from("route_coverage")
      .select("neighborhood_id")
      .eq("route_id", routeId)
      .in("neighborhood_id", [...loadedNeighborhoodIds]);

    const existingIds = new Set(
      existingCoverage?.map((x) => Number(x.neighborhood_id)) ?? []
    );

    const incomingIds = new Set(
      selectedNeighborhoods.filter((id) => loadedNeighborhoodIds.has(id))
    );

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    const toInsert = [...incomingIds].filter((id) => !existingIds.has(id));

    if (toDelete.length > 0) {
      await supabase
        .from("route_coverage")
        .delete()
        .eq("route_id", routeId)
        .in("neighborhood_id", toDelete);
    }

    if (toInsert.length > 0) {
      await supabase.from("route_coverage").insert(
        toInsert.map((neighborhoodId) => ({
          route_id: routeId,
          neighborhood_id: neighborhoodId,
        }))
      );
    }

    // Limpiar configuración de distritos y días
    await supabase
      .from("route_district_delivery_times")
      .delete()
      .eq("route_id", routeId);

    await supabase
      .from("route_district_visit_days")
      .delete()
      .eq("route_id", routeId);
  }

  // ── CREAR ─────────────────────────────────────────────────────────────────
  else {
    const { data, error } = await supabase
      .from("routes")
      .insert({
        name: routeName,
        estimated_hours: estimatedHours,
        company_delivery_charge,
        courier_delivery_pay,
        company_failed_charge,
        courier_failed_pay,
      })
      .select()
      .single();

    if (error) throw error;

    currentRouteId = data.id;

    if (selectedNeighborhoods.length > 0) {
      await supabase.from("route_coverage").insert(
        selectedNeighborhoods.map((neighborhoodId) => ({
          route_id: currentRouteId,
          neighborhood_id: neighborhoodId,
        }))
      );
    }
  }

  // ── DÍAS BASE (aplica a crear y editar) ───────────────────────────────────
  if (selectedDays.length > 0) {
    await supabase.from("route_visit_days").insert(
      selectedDays.map((day) => ({
        route_id: currentRouteId,
        day: day.toLowerCase(),
      }))
    );
  }

  // ── HORAS POR DISTRITO ────────────────────────────────────────────────────
  if (districtDeliveryTimes.length > 0) {
    await supabase.from("route_district_delivery_times").insert(
      districtDeliveryTimes.map((item) => ({
        route_id: currentRouteId,
        district_id: item.district_id,
        min_hours: item.min_hours,
        max_hours: item.max_hours,
      }))
    );
  }

  // ── DÍAS POR DISTRITO ─────────────────────────────────────────────────────
  const districtDaysPayload = districtVisitDays.flatMap((district) =>
    district.days.map((day) => ({
      route_id: currentRouteId,
      district_id: district.district_id,
      day,
    }))
  );

  if (districtDaysPayload.length > 0) {
    await supabase.from("route_district_visit_days").insert(districtDaysPayload);
  }

  return currentRouteId;
}