import { createClient } from "@/lib/supabase/client";
import type {
  CompanyProduct,
} from "../types/company-product";

export async function getCompanyProducts(
  companyId: string,
): Promise<CompanyProduct[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from("products")

      .select(`
        id,
        name,
        sku,

        company_products(
          company_id,
          active
        )
      `)

      .order(
        "name",
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (product: any) => ({

      id:
        product.id,

      name:
        product.name,

      sku:
        product.sku,

      selected:
        product.company_products?.some(
          (cp: any) =>

            cp.company_id === companyId &&
            cp.active,
        ) ?? false,

    }),
  );

}