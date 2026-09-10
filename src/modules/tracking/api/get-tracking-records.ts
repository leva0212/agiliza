import { createClient } from "@/lib/supabase/client";
import type { TrackingRecord } from "../types/tracking-record";

export type TrackingRecordFilters = {
  pageIndex: number;
  pageSize: number;
  startDate: string;
  endDate: string;
  companyId?: string;
  status?: string;
  provinceId?: number;
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
  search,
}: TrackingRecordFilters) {
  const supabase = createClient();
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

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
        status,
        comment,
        company:companies(id, name, trade_name),
        province:provinces(id, name)
      `,
      { count: "exact" },
    )
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59.999`);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (provinceId) {
    query = query.eq("province_id", provinceId);
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

  const records = (data ?? []).map((record) => ({
    ...record,
    company: Array.isArray(record.company)
      ? record.company[0] ?? null
      : record.company,
    province: Array.isArray(record.province)
      ? record.province[0] ?? null
      : record.province,
  })) as TrackingRecord[];

  return {
    data: records,
    total: count ?? 0,
  };
}
