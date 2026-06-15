import { createClient } from "@/lib/supabase/client";

export async function createDefaultRatesForRoute(
    routeId: string,
) {

    const supabase =
        createClient();

    const {
        data: companies,
        error: companiesError,
    } = await supabase

        .from(
            "companies",
        )

        .select(`
      id,
      delivery_charge,
      failed_charge
    `)

        .eq(
            "active",
            true,
        );

    if (
        companiesError
    ) {
        throw companiesError;
    }

    if (
        !companies?.length
    ) {
        return;
    }

    const rows =

        companies

            .filter(

                company =>

                    Number(
                        company.delivery_charge,
                    ) > 0 ||

                    Number(
                        company.failed_charge,
                    ) > 0,

            )

            .map(

                company => ({

                    company_id:
                        company.id,

                    route_id:
                        routeId,

                    province_id:
                        null,

                    canton_id:
                        null,

                    district_id:
                        null,

                    neighborhood_id:
                        null,

                    delivery_charge:
                        company.delivery_charge,

                    failed_charge:
                        company.failed_charge,

                    active:
                        true,

                }),

            );

    if (
        rows.length === 0
    ) {
        return;
    }

    const {
        error,
    } = await supabase

        .from(
            "delivery_rates",
        )

        .insert(
            rows,
        );

    if (
        error
    ) {
        throw error;
    }

}