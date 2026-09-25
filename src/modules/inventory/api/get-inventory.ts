import { createClient } from "@/lib/supabase/client";
import { Inventory, InventoryFilters, InventorySummary } from "../types/inventory";

const emptySummary = (): InventorySummary => ({ totalQuantity: 0, totalRecords: 0, lowRecords: 0, mediumRecords: 0, highRecords: 0, lowCouriers: 0, lowCompanies: 0, lowProducts: 0 });

export async function getInventory(filters: InventoryFilters): Promise<{ rows: Inventory[]; totalRows: number; summary: InventorySummary }> {
  const supabase = createClient();
  const params = { p_courier_id: filters.courierId ?? null, p_company_id: filters.companyId ?? null, p_product_id: filters.productId ?? null, p_quantity_operator: filters.quantityOperator ?? null, p_quantity_value: filters.quantityValue ?? null, p_quantity_value2: filters.quantityValue2 ?? null, p_stock_status: filters.stockStatus ?? null };
  const [pageResult, summaryResult] = await Promise.all([
    supabase.rpc("get_inventory_page", { ...params, p_limit: filters.pageSize, p_offset: filters.pageIndex * filters.pageSize }),
    supabase.rpc("get_inventory_summary", params),
  ]);
  if (pageResult.error) throw pageResult.error;
  if (summaryResult.error) throw summaryResult.error;
  const row = summaryResult.data?.[0];
  const summary: InventorySummary = { totalQuantity: Number(row?.total_quantity ?? 0), totalRecords: Number(row?.total_records ?? 0), lowRecords: Number(row?.low_records ?? 0), mediumRecords: Number(row?.medium_records ?? 0), highRecords: Number(row?.high_records ?? 0), lowCouriers: Number(row?.low_couriers ?? 0), lowCompanies: Number(row?.low_companies ?? 0), lowProducts: Number(row?.low_products ?? 0) };
  return { rows: (pageResult.data ?? []) as Inventory[], totalRows: summary.totalRecords, summary };
}
