import {
  useQuery,
} from "@tanstack/react-query";

import {
  getInventory,
} from "../api/get-inventory";

import {
  InventoryFilters,
} from "../types/inventory";

export function useInventory(
  filters: InventoryFilters,
) {

  return useQuery({

    queryKey: [

      "inventory",

      filters,

    ],

    queryFn: () =>
      getInventory(
        filters,
      ),

    enabled:

      !!filters.courierId ||

      !!filters.companyId ||

      !!filters.productId ||

      !!filters.quantityOperator,

  });

}