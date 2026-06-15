import { createClient } from "@/lib/supabase/client";

type Input = {
  companyId: string;

  deliveryCharge: number;

  failedCharge: number;
};

export async function propagateCompanyRates(
  input: Input,
) {

  const supabase =
    createClient();

  const {
    data: routes,
    error: routesError,
  } = await supabase

    .from(
      "routes",
    )

    .select(
      "id",
    );

  if (
    routesError
  ) {
    throw routesError;
  }

  for (
    const route of
    routes ?? []
  ) {

    const {
      data: existing,
      error: searchError,
    } = await supabase

      .from(
        "delivery_rates",
      )

      .select(
        "id",
      )

      .eq(
        "company_id",
        input.companyId,
      )

      .eq(
        "route_id",
        route.id,
      )

      .is(
        "province_id",
        null,
      )

      .is(
        "canton_id",
        null,
      )

      .is(
        "district_id",
        null,
      )

      .is(
        "neighborhood_id",
        null,
      )

      .maybeSingle();

    if (
      searchError
    ) {
      throw searchError;
    }

    if (
      existing
    ) {

      const {
        error,
      } = await supabase

        .from(
          "delivery_rates",
        )

        .update({

          delivery_charge:
            input.deliveryCharge,

          failed_charge:
            input.failedCharge,

        })

        .eq(
          "id",
          existing.id,
        );

      if (
        error
      ) {
        throw error;
      }

    } else {

      const {
        error,
      } = await supabase

        .from(
          "delivery_rates",
        )

        .insert({

          company_id:
            input.companyId,

          route_id:
            route.id,

          province_id:
            null,

          canton_id:
            null,

          district_id:
            null,

          neighborhood_id:
            null,

          delivery_charge:
            input.deliveryCharge,

          failed_charge:
            input.failedCharge,

          active:
            true,

        });

      if (
        error
      ) {
        throw error;
      }

    }

  }

}