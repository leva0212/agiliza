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

  console.log(
    "getCompanyProductsOptions companyId:",
    companyId,
  );

  console.log(
    "getCompanyProductsOptions companyId:",
    companyId,
  );

  if (error) {
    throw error;
  }
  console.log(
    "company_products raw:",
    data,
  );
  const result = (data ?? []).map((row: any) => ({
    id: row.product.id,
    name: row.product.name,
    default_deposit: row.product.default_deposit,
    default_shipping_fee: row.product.default_shipping_fee,
  }));

  console.log(
    "company_products mapped:",
    result,
  );

  return result;
}
