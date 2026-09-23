import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type District = { id: number; name: string; canton: { name: string } | { name: string }[] | null };
type CoverageRow = {
  route_id: string;
  neighborhood: { id: number; district_id: number } | { id: number; district_id: number }[] | null;
};

function first<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const provinceName = request.nextUrl.searchParams.get("province")?.trim();

  if (!user) return Response.json({ message: "Debe iniciar sesión." }, { status: 401 });
  if (!provinceName) return Response.json({ message: "Provincia inválida." }, { status: 400 });

  const [{ data: profile }, { data: province, error: provinceError }] = await Promise.all([
    supabaseAdmin.from("profiles").select("active").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("provinces").select("id").eq("name", provinceName).maybeSingle(),
  ]);
  if (!profile?.active) return Response.json({ message: "El usuario no está habilitado." }, { status: 403 });
  if (provinceError) return Response.json({ message: provinceError.message }, { status: 400 });
  if (!province) return Response.json([]);

  const { data: districts, error: districtsError } = await supabaseAdmin
    .from("districts")
    .select("id, name, canton:cantons!inner(name, province_id)")
    .eq("canton.province_id", province.id)
    .returns<District[]>();
  if (districtsError) return Response.json({ message: districtsError.message }, { status: 400 });

  const districtById = new Map((districts ?? []).map((district) => [district.id, {
    district: district.name,
    canton: first(district.canton)?.name ?? "",
  }]));
  const districtIds = [...districtById.keys()];
  if (districtIds.length === 0) return Response.json([]);

  const [{ data: coverage, error: coverageError }, { data: deliveryTimes }, { data: visitDays }] = await Promise.all([
    supabaseAdmin
      .from("route_coverage")
      .select("route_id, neighborhood:neighborhoods!inner(id, district_id), route:routes!inner(coverage_active)")
      .in("neighborhood.district_id", districtIds)
      .eq("route.coverage_active", true)
      .returns<CoverageRow[]>(),
    supabaseAdmin
      .from("route_district_delivery_times")
      .select("route_id, district_id, min_hours, max_hours, route:routes!inner(coverage_active)")
      .in("district_id", districtIds)
      .eq("route.coverage_active", true),
    supabaseAdmin
      .from("route_district_visit_days")
      .select("route_id, district_id, day, route:routes!inner(coverage_active)")
      .in("district_id", districtIds)
      .eq("route.coverage_active", true),
  ]);
  if (coverageError) return Response.json({ message: coverageError.message }, { status: 400 });

  const neighborhoodsByDistrict = new Map<number, Set<number>>();
  for (const item of coverage ?? []) {
    const neighborhood = first(item.neighborhood);
    if (!neighborhood) continue;
    const values = neighborhoodsByDistrict.get(neighborhood.district_id) ?? new Set<number>();
    values.add(neighborhood.id);
    neighborhoodsByDistrict.set(neighborhood.district_id, values);
  }

  const timeByDistrict = new Map<number, { min_hours: number; max_hours: number }>();
  for (const item of deliveryTimes ?? []) {
    if (!timeByDistrict.has(item.district_id)) timeByDistrict.set(item.district_id, item);
  }
  const daysByDistrict = new Map<number, string[]>();
  for (const item of visitDays ?? []) {
    daysByDistrict.set(item.district_id, [...(daysByDistrict.get(item.district_id) ?? []), item.day]);
  }

  return Response.json([...neighborhoodsByDistrict.entries()].map(([districtId, neighborhoods]) => ({
    district_id: districtId,
    canton: districtById.get(districtId)?.canton ?? "",
    district: districtById.get(districtId)?.district ?? "",
    covered_count: neighborhoods.size,
    min_hours: timeByDistrict.get(districtId)?.min_hours ?? 0,
    max_hours: timeByDistrict.get(districtId)?.max_hours ?? 0,
    visit_days: daysByDistrict.get(districtId) ?? [],
  })));
}
