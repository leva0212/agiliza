import { createClient } from "@/lib/supabase/client";

type Input = {
    profileId: string;

    deliveryPay: number;

    failedPay: number;
};

export async function propagateCourierRates(
    input: Input,
) {
    const supabase =
        createClient();

    const {
        data: courier,
        error: courierError,
    } = await supabase

        .from(
            "couriers",
        )

        .select(
            "id",
        )

        .eq(
            "profile_id",
            input.profileId,
        )

        .eq(
            "active",
            true,
        )

        .single();

    if (
        courierError
    ) {
        throw courierError;
    }

    const {
        data: routes,
        error: routesError,
    } = await supabase

        .from(
            "courier_routes",
        )

        .select(
            "route_id",
        )

        .eq(
            "courier_id",
            courier.id,
        );

    if (
        routesError
    ) {
        throw routesError;
    }

    if (
        !routes ||
        routes.length === 0
    ) {

        throw new Error(
            "El mensajero no tiene rutas asignadas.",
        );

    }

    for (
        const route of
        routes
    ) {

        const {
            data: existing,
            error: searchError,
        } = await supabase

            .from(
                "courier_delivery_rates",
            )

            .select(
                "id",
            )

            .eq(
                "courier_id",
                courier.id,
            )

            .eq(
                "route_id",
                route.route_id,
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
                    "courier_delivery_rates",
                )

                .update({

                    delivery_pay:
                        input.deliveryPay,

                    failed_pay:
                        input.failedPay,

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
                    "courier_delivery_rates",
                )

                .insert({

                    courier_id:
                        courier.id,

                    route_id:
                        route.route_id,

                    province_id:
                        null,

                    canton_id:
                        null,

                    district_id:
                        null,

                    neighborhood_id:
                        null,

                    delivery_pay:
                        input.deliveryPay,

                    failed_pay:
                        input.failedPay,

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