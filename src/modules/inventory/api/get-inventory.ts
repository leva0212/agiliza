import { createClient } from "@/lib/supabase/client";

import { Inventory, InventoryFilters } from "../types/inventory";

export async function getInventory(filters: InventoryFilters): Promise<{
  rows: Inventory[];
  totalRows: number;
}> {
  const supabase = createClient();

  const hasFilters =
    !!filters.courierId ||
    !!filters.companyId ||
    !!filters.productId ||
    !!filters.quantityOperator;

  if (!hasFilters) {
    return {
      rows: [],

      totalRows: 0,
    };
  }

  let query = supabase

    .from("inventory")

    .select(
      `
        *,
        company:companies(
          name
        ),
        product:products(
          name
        ),
        courier:couriers(
          profile:profiles(
            full_name
          )
        )
      `,
      {
        count: "exact",
      },
    );

  if (filters.courierId) {
    query = query.eq("courier_id", filters.courierId);
  }

  if (filters.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  switch (filters.quantityOperator) {
    case "=":
      query = query.eq("quantity", filters.quantityValue);

      break;

    case "<":
      query = query.lt("quantity", filters.quantityValue!);

      break;

    case "<=":
      query = query.lte("quantity", filters.quantityValue!);

      break;

    case ">":
      query = query.gt("quantity", filters.quantityValue!);

      break;

    case ">=":
      query = query.gte("quantity", filters.quantityValue!);

      break;

    case "between":
      query = query

        .gte("quantity", filters.quantityValue!)

        .lte("quantity", filters.quantityValue2!);

      break;
  }

  const from = filters.pageIndex * filters.pageSize;

  const to = from + filters.pageSize - 1;

  const { data, error, count } = await query

    .range(from, to)

    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const rows = (data ?? []).map((row: any) => {
    let stockStatus: "low" | "medium" | "high";

    if (row.quantity < row.low_stock) {
      stockStatus = "low";
    } else if (row.quantity < row.medium_stock) {
      stockStatus = "medium";
    } else {
      stockStatus = "high";
    }

    return {
      ...row,

      stock_status: stockStatus,

      company_name: row.company?.name,

      product_name: row.product?.name,

      courier_name: row.courier?.profile?.full_name,
    };
  });

  return {
    rows,

    totalRows: count ?? 0,
  };
}
