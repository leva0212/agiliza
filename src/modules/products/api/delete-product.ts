import { createClient } from "@/lib/supabase/client";

export async function deleteProduct(productId: string) {
  const { error } = await createClient().from("products").delete().eq("id", productId);
  if (error) throw error;
}
