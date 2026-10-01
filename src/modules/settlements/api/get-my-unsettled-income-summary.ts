import { createClient } from "@/lib/supabase/client";

export type MyUnsettledIncomeSummary = {
  period_starts_at: string | null;
  period_ends_at: string | null;
  deliveries_count: number;
  delivery_income: number;
  deposits_collected: number;
  shipping_collected: number;
  net_amount: number;
};

export async function getMyUnsettledIncomeSummary(): Promise<MyUnsettledIncomeSummary> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_my_unsettled_income_summary");
  if (error) throw error;
  const summary = Array.isArray(data) ? data[0] : data;
  return {
    period_starts_at: summary?.period_starts_at ?? null,
    period_ends_at: summary?.period_ends_at ?? null,
    deliveries_count: Number(summary?.deliveries_count ?? 0),
    delivery_income: Number(summary?.delivery_income ?? 0),
    deposits_collected: Number(summary?.deposits_collected ?? 0),
    shipping_collected: Number(summary?.shipping_collected ?? 0),
    net_amount: Number(summary?.net_amount ?? 0),
  };
}
