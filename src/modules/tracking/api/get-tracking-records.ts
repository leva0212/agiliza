import { createClient } from "@/lib/supabase/client";
import { getVisibleCompanyDirectory } from "@/modules/companies/api/get-visible-company-directory";
import { getDistrictRouteCoverage } from "@/modules/routes/api/get-district-route-coverage";
import type { TrackingRecord } from "../types/tracking-record";

type TrackingCreatorLabel = {
  record_id: string;
  created_by_label: string;
  created_by_company_label: string;
};

export type TrackingRecordFilters = {
  pageIndex: number;
  pageSize: number;
  startDate: string;
  endDate: string;
  companyId?: string;
  status?: string;
  provinceId?: number;
  cantonId?: number;
  districtId?: number;
  classification?: "gam" | "rural";
  search?: string;
};

export async function getTrackingRecords({
  pageIndex,
  pageSize,
  startDate,
  endDate,
  companyId,
  status,
  provinceId,
  cantonId,
  districtId,
  classification,
  search,
}: TrackingRecordFilters) {
  const supabase = createClient();
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;
  let classifiedCantonIds: number[] | undefined;

  if (classification) {
    const { data: cantons, error: cantonsError } = await supabase
      .from("cantons")
      .select("id")
      .eq("area_classification", classification);
    if (cantonsError) throw cantonsError;
    classifiedCantonIds = (cantons ?? []).map((canton) => Number(canton.id));
    if (!classifiedCantonIds.length) return { data: [], total: 0 };
  }

  let query = supabase
    .from("tracking_records")
    .select(
      `
        id,
        created_at,
        company_id,
        full_name,
        identification,
        province_id,
        canton_id,
        district_id,
        status,
        comment,
        province:provinces(id, name),
        canton:cantons(id, name, area_classification),
        district:districts(id, name)
      `,
      { count: "exact" },
    )
    .gte("created_at", `${startDate}T00:00:00-06:00`)
    .lte("created_at", `${endDate}T23:59:59.999-06:00`);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (provinceId) {
    query = query.eq("province_id", provinceId);
  }

  if (cantonId) {
    query = query.eq("canton_id", cantonId);
  }

  if (districtId) {
    query = query.eq("district_id", districtId);
  }

  if (classifiedCantonIds) {
    query = query.in("canton_id", classifiedCantonIds);
  }

  if (search?.trim()) {
    const text = search.trim().replaceAll(",", " ");
    query = query.or(
      `full_name.ilike.%${text}%,identification.ilike.%${text}%`,
    );
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const recordIds = (data ?? []).map((record) => record.id);
  const [{ data: creatorLabels, error: creatorLabelsError }, directory, routeCoverage] = await Promise.all([
    supabase.rpc("get_tracking_record_creator_labels", { p_record_ids: recordIds }),
    getVisibleCompanyDirectory((data ?? []).map((record) => record.company_id)),
    getDistrictRouteCoverage((data ?? []).map((record) => Number(record.district_id))),
  ]);
  if (creatorLabelsError) throw creatorLabelsError;
  const creatorLabelsByRecordId = new Map(
    ((creatorLabels ?? []) as TrackingCreatorLabel[]).map((label) => [label.record_id, label]),
  );
  const companiesById = new Map(directory.map((company) => [company.id, company]));
  const coverageByDistrictId = new Map<number, typeof routeCoverage>();
  for (const coverage of routeCoverage) {
    coverageByDistrictId.set(coverage.districtId, [
      ...(coverageByDistrictId.get(coverage.districtId) ?? []),
      coverage,
    ]);
  }
  const records = (data ?? []).map((record) => ({
    ...record,
    created_by_label: creatorLabelsByRecordId.get(record.id)?.created_by_label ?? "Sin información",
    created_by_company_label: creatorLabelsByRecordId.get(record.id)?.created_by_company_label ?? "Sin información",
    company: companiesById.get(record.company_id) ?? null,
    province: Array.isArray(record.province)
      ? record.province[0] ?? null
      : record.province,
    canton: Array.isArray(record.canton)
      ? record.canton[0] ?? null
      : record.canton,
    district: Array.isArray(record.district)
      ? record.district[0] ?? null
      : record.district,
    route_coverage: coverageByDistrictId.get(Number(record.district_id)) ?? [],
  })) as TrackingRecord[];

  return {
    data: records,
    total: count ?? 0,
  };
}
