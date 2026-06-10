import { createClient } from "@/lib/supabase/client";

import { Product } from "../types/product";

export async function getProductById(
  id: string,
): Promise<Product> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from("products")

      .select("*")

      .eq(
        "id",
        id,
      )

      .single();

  if (error) {
    throw error;
  }

  return data as Product;

}