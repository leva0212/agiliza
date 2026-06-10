import { createClient } from "@/lib/supabase/client";

import { Product } from "../types/product";

export async function getProducts():
  Promise<Product[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from("products")

      .select("*")

      .order(
        "name",
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as Product[];

}