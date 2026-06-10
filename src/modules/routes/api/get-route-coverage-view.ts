import { createClient } from "@/lib/supabase/client";

export async function getRouteCoverageView(

  routeId: string,

  pageIndex = 0,

  pageSize = 100

) { const supabase = createClient();

  const from =
    pageIndex *
    pageSize;

  const to =
    from +
    pageSize -
    1;

  const {
    data,

    count,

    error,
  } =
    await supabase

      .from(
        "route_coverage"
      )

      .select(
        `
        neighborhood_id,

        neighborhoods (
          id,
          name,

          districts (
            id,
            name,

            cantons (
              id,
              name,

              provinces (
                id,
                name
              )
            )
          )
        )
        `,
        {
          count:
            "exact",
        }
      )

      .eq(
        "route_id",
        routeId
      )

      .range(
        from,
        to
      );

  if (
    error
  ) {
    throw error;
  }

  return {

    data:

      data?.map(
        (
          item: any
        ) => ({

          id:
            item
              .neighborhoods
              .id,

          province:
            item
              .neighborhoods
              .districts
              .cantons
              .provinces
              .name,

          canton:
            item
              .neighborhoods
              .districts
              .cantons
              .name,

          district:
            item
              .neighborhoods
              .districts
              .name,

          neighborhood:
            item
              .neighborhoods
              .name,

        })
      ) || [],

    total:
      count || 0,

  };

}