import { createClient } from "@/lib/supabase/client";
import type {
  CompanyProductOption,
} from "../types/company-product-option";

export async function getCompanyProductsOptions(
  companyId: string,
): Promise<
  CompanyProductOption[]
> {
  const supabase = createClient();

  const { data, error } = await supabase

    .from("company_products")

    .select(
      `
      product_id,
      product:products(
        id,
        name,
        default_deposit,
        default_shipping_fee
      )
    `,
    )

    .eq("company_id", companyId)

    .eq("active", true);



  if (error) {
    throw error;
  }
  const result = (data ?? []).map((row: any) => ({
    id: row.product.id,
    name: row.product.name,
    default_deposit: row.product.default_deposit,
    default_shipping_fee: row.product.default_shipping_fee,
  }));


  return result;
}
