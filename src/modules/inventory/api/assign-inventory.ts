import { createClient } from "@/lib/supabase/client";
import { AssignInventoryInput } from "../types/assign-inventory";

export async function assignInventory(input: AssignInventoryInput) {
  const { data, error } = await createClient().rpc("adjust_inventory", {
    p_courier_id: input.courier_id,
    p_company_id: input.company_id,
    p_product_id: input.product_id,
    p_quantity_change: input.quantity,
    p_low_stock: input.low_stock,
    p_medium_stock: input.medium_stock,
    p_reason: input.reason,
    p_notes: input.notes ?? null,
    p_created_by: input.created_by,
  });

  if (error) throw error;
  const result = data?.[0];
  return { id: result?.inventory_id, quantity: result?.quantity_after, created: false };
}
