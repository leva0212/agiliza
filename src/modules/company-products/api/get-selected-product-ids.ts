import { createClient } from "@/lib/supabase/client";

export async function getSelectedProductIds(
  companyId: string,
): Promise<string[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "company_products",
      )

      .select(
        "product_id",
      )

      .eq(
        "company_id",
        companyId,
      )

      .eq(
        "active",
        true,
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (row) =>
      row.product_id,
  );

}