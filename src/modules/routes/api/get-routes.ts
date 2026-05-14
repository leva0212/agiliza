import { supabase } from "@/services/supabase/client";

type Params = {
  pageIndex: number;

  pageSize: number;
};

export async function getRoutes({
  pageIndex,

  pageSize,
}: Params) {
  const from =
    pageIndex * pageSize;

  const to =
    from + pageSize - 1;

  const {
    data,

    count,

    error,
  } =
    await supabase
      .from("routes")
      .select(
        "*",
        {
          count:
            "exact",
        }
      )
      .range(
        from,
        to
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (
    error
  ) {
    throw error;
  }

  return {
    data:
      data || [],

    total:
      count || 0,
  };
}