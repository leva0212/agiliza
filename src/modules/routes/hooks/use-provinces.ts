import { useQuery } from "@tanstack/react-query";

import { getProvinces } from "../api/get-provinces";

export function useProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
  });
}