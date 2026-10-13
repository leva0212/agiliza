import { createClient } from "@/lib/supabase/client";
import type {
  SerializedInventoryFilters,
  SerializedInventoryItem,
} from "../types/serialized-inventory-item";

export async function getSerializedInventoryItems(
  filters: SerializedInventoryFilters,
) {
  const { data, error } = await createClient().rpc(
    "get_inventory_serialized_items_page",
    {
      p_barcode: filters.barcode || null,
      p_company: filters.company || null,
      p_courier: filters.courier || null,
      p_product: filters.product || null,
      p_imported_by: filters.importedBy || null,
      p_status: filters.status || null,
      p_image_filter: filters.imageFilter || null,
      p_from: filters.from || null,
      p_to: filters.to || null,
      p_limit: filters.pageSize,
      p_offset: filters.pageIndex * filters.pageSize,
    },
  );

  if (error) throw error;

  const rows = (data ?? []) as SerializedInventoryItem[];
  return {
    rows,
    totalRows: Number(rows[0]?.total_count ?? 0),
  };
}
