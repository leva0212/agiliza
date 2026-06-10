import { useQuery } from "@tanstack/react-query";

import { getCompanies } from "@/modules/companies/api/get-companies";

export function useCompanies(
  pageIndex: number,
  pageSize: number,
) {
  return useQuery({

    queryKey: [

      "companies",

      pageIndex,

      pageSize,

    ],

    queryFn: () =>

      getCompanies({

        pageIndex,

        pageSize,

      }),

  });
}