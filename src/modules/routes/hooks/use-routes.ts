import { useQuery } from "@tanstack/react-query";

import { getRoutes } from "@/modules/routes/api/get-routes";

export function useRoutes(
  pageIndex: number,
  pageSize: number
) {
  return useQuery({
    queryKey: [
      "routes",

      pageIndex,

      pageSize,
    ],

    queryFn: () =>
      getRoutes({
        pageIndex,

        pageSize,
      }),
  });
}