import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: movements, error } = await supabase.from("inventory_movements").select("id,inventory_id,created_at,quantity_before,quantity_change,quantity_after,reason,notes").order("created_at", { ascending: false });
  if (error) return Response.json({ message: error.message }, { status: 400 });
  const ids = [...new Set((movements ?? []).map((movement) => movement.inventory_id).filter(Boolean))];
  if (!ids.length) return Response.json([]);
  const { data: inventories, error: inventoryError } = await supabase.from("inventory").select("id,courier:couriers(profile:profiles(full_name)),company:companies(name),product:products(name)").in("id", ids);
  if (inventoryError) return Response.json({ message: inventoryError.message }, { status: 400 });
  const inventoryById = new Map((inventories ?? []).map((inventory: any) => [inventory.id, { courier_name: inventory.courier?.profile?.full_name ?? null, company_name: inventory.company?.name ?? null, product_name: inventory.product?.name ?? null }]));
  return Response.json((movements ?? []).map((movement) => ({ ...movement, inventory: inventoryById.get(movement.inventory_id) ?? null })));
}
