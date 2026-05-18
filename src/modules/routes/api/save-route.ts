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
}: Params) {
  let currentRouteId = routeId;

  // ── EDITAR ──────────────────────────────────────────────────────────────
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

    // ── DÍAS BASE: delete + re-insert (simple, pocos registros)
    await supabase.from("route_visit_days").delete().eq("route_id", routeId);

    // ── COBERTURA: merge (diff) para NO borrar barrios que no se navegaron
    // Lógica: comparar lo que hay en BD vs lo que viene del estado en memoria.
    // Solo borrar los que salieron, solo insertar los nuevos.
    const { data: existingCoverage } = await supabase
      .from("route_coverage")
      .select("neighborhood_id")
      .eq("route_id", routeId);

    const existingIds = new Set(
      existingCoverage?.map((r) => r.neighborhood_id) ?? [],
    );
    const incomingIds = new Set(selectedNeighborhoods);

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
        })),
      );
    }

    // ── HORAS POR DISTRITO: merge (diff)
    // El usuario puede tener distritos configurados sin barrios → los respetamos.
    if (districtDeliveryTimes.length > 0) {
      const { data: existingTimes } = await supabase
        .from("route_district_delivery_times")
        .select("district_id")
        .eq("route_id", routeId);

      const existingDistrictIds = new Set(
        existingTimes?.map((r) => r.district_id) ?? [],
      );
      const incomingDistrictIds = new Set(
        districtDeliveryTimes.map((r) => r.district_id),
      );

      // Borrar los que ya no están configurados
      const timesToDelete = [...existingDistrictIds].filter(
        (id) => !incomingDistrictIds.has(id),
      );
      if (timesToDelete.length > 0) {
        await supabase
          .from("route_district_delivery_times")
          .delete()
          .eq("route_id", routeId)
          .in("district_id", timesToDelete);
      }

      // Upsert los que vienen (inserta nuevos, actualiza existentes)
      await supabase.from("route_district_delivery_times").upsert(
        districtDeliveryTimes.map((item) => ({
          route_id: routeId,
          district_id: item.district_id,
          min_hours: item.min_hours,
          max_hours: item.max_hours,
        })),
        { onConflict: "route_id,district_id" },
      );
    } else {
      // Si no viene ningún distrito configurado, limpiar todos
      await supabase
        .from("route_district_delivery_times")
        .delete()
        .eq("route_id", routeId);
    }

    // ── DÍAS POR DISTRITO: delete + re-insert (más simple que diff por ser filas planas)
    await supabase
      .from("route_district_visit_days")
      .delete()
      .eq("route_id", routeId);
  }

  // ── CREAR ───────────────────────────────────────────────────────────────
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

    // En creación, insertar cobertura directamente
    if (selectedNeighborhoods.length > 0) {
      await supabase.from("route_coverage").insert(
        selectedNeighborhoods.map((neighborhoodId) => ({
          route_id: currentRouteId,
          neighborhood_id: neighborhoodId,
        })),
      );
    }

    // En creación, insertar horas por distrito directamente
    if (districtDeliveryTimes.length > 0) {
      await supabase.from("route_district_delivery_times").insert(
        districtDeliveryTimes.map((item) => ({
          route_id: currentRouteId,
          district_id: item.district_id,
          min_hours: item.min_hours,
          max_hours: item.max_hours,
        })),
      );
    }
  }

  // ── DÍAS BASE (aplica a crear y editar)
  if (selectedDays.length > 0) {
    await supabase.from("route_visit_days").insert(
      selectedDays.map((day) => ({
        route_id: currentRouteId,
        day: day.toLowerCase(),
      })),
    );
  }

  // ── DÍAS POR DISTRITO (aplica a crear y editar)
  if (districtVisitDays.length > 0) {
    const rows = districtVisitDays.flatMap((district) =>
      district.days.map((day) => ({
        route_id: currentRouteId,
        district_id: district.district_id,
        day,
      })),
    );
    await supabase.from("route_district_visit_days").insert(rows);
  }

  return currentRouteId;
}


/*import { supabase } from "@/services/supabase/client";

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
}: Params) {
  let currentRouteId = routeId;

  // ── EDITAR ──────────────────────────────────────────────────────────────
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

    // BUG FIX: el delete de route_district_delivery_times estaba duplicado.
    // Se ejecutaba dos veces seguidas lo cual era redundante y podía causar
    // errores de concurrencia si la tabla tenía constraints o triggers.
    await supabase.from("route_visit_days").delete().eq("route_id", routeId);
    await supabase.from("route_coverage").delete().eq("route_id", routeId);
    await supabase.from("route_district_delivery_times").delete().eq("route_id", routeId);
    await supabase.from("route_district_visit_days").delete().eq("route_id", routeId);
  }

  // ── CREAR ───────────────────────────────────────────────────────────────
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
  }

  // ── DÍAS BASE ────────────────────────────────────────────────────────────
  if (selectedDays.length > 0) {
    await supabase.from("route_visit_days").insert(
      selectedDays.map((day) => ({
        route_id: currentRouteId,
        day: day.toLowerCase(),
      })),
    );
  }

  // ── COBERTURA (barrios) ──────────────────────────────────────────────────
  if (selectedNeighborhoods.length > 0) {
    await supabase.from("route_coverage").insert(
      selectedNeighborhoods.map((neighborhoodId) => ({
        route_id: currentRouteId,
        neighborhood_id: neighborhoodId,
      })),
    );
  }

  // ── HORAS POR DISTRITO ───────────────────────────────────────────────────
  if (districtDeliveryTimes.length > 0) {
    await supabase.from("route_district_delivery_times").upsert(
      districtDeliveryTimes.map((item) => ({
        route_id: currentRouteId,
        district_id: item.district_id,
        min_hours: item.min_hours,
        max_hours: item.max_hours,
      })),
      { onConflict: "route_id,district_id" },
    );
  }

  // ── DÍAS POR DISTRITO ────────────────────────────────────────────────────
  if (districtVisitDays.length > 0) {
    const rows = districtVisitDays.flatMap((district) =>
      district.days.map((day) => ({
        route_id: currentRouteId,
        district_id: district.district_id,
        day,
      })),
    );

    await supabase.from("route_district_visit_days").insert(rows);
  }

  return currentRouteId;
}*/