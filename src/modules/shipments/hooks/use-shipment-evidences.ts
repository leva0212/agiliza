"use client";

import { useQuery } from "@tanstack/react-query";

import { getShipmentEvidences }
    from "../api/get-shipment-evidences";

export function useShipmentEvidences(
    shipmentId: string,
) {
    return useQuery({
        queryKey: [
            "shipment-evidences",
            shipmentId,
        ],

        queryFn: () =>
            getShipmentEvidences(
                shipmentId,
            ),

        staleTime:
            1000 * 60 * 5,
    });
}