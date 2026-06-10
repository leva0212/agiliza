import { createClient } from "@/lib/supabase/client";

export async function saveCompanyProducts(
  companyId: string,

  productIds: string[],
) {

  const supabase =
    createClient();

  const {
    error:
      deleteError,
  } =
    await supabase

      .from(
        "company_products",
      )

      .delete()

      .eq(
        "company_id",
        companyId,
      );

  if (deleteError) {
    throw deleteError;
  }

  if (
    productIds.length === 0
  ) {

    return;

  }

  const {
    error:
      insertError,
  } =
    await supabase

      .from(
        "company_products",
      )

      .insert(

        productIds.map(
          (
            productId,
          ) => ({

            company_id:
              companyId,

            product_id:
              productId,

            active:
              true,

          }),
        ),

      );

  if (insertError) {
    throw insertError;
  }

}