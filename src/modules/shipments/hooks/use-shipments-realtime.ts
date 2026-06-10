"use client";

import { useEffect } from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClient,
} from "@/lib/supabase/client";

export function useShipmentsRealtime() {

  const queryClient =
    useQueryClient();

  useEffect(() => {

    const supabase =
      createClient();

    const channel =

      supabase

        .channel(
          "shipments-realtime",
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shipments",
          },
          () => {

            queryClient.invalidateQueries({
              queryKey: [
                "shipments",
              ],
            });

            queryClient.invalidateQueries({
              queryKey: [
                "shipment",
              ],
            });

          },
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "shipment_status_history",
          },
          () => {

            queryClient.invalidateQueries({
              queryKey: [
                "shipment-status-history",
              ],
            });

          },
        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel,
      );

    };

  }, [queryClient]);

}