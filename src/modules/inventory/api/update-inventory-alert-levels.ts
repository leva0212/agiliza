import { createClient } from "@/lib/supabase/client";

export async function updateInventoryAlertLevels(input: { id: string; lowStock: number; mediumStock: number }) {
  const { error } = await createClient()
    .from("inventory")
    .update({ low_stock: input.lowStock, medium_stock: input.mediumStock, updated_at: new Date().toISOString() })
    .eq("id", input.id);
  if (error) throw error;
}
