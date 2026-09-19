"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

type InvalidatedArea = "shipments" | "history" | "evidences" | "attachments";

export function useShipmentsRealtime(
  includeShipmentFiles = false,
  shipmentId?: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const pendingAreas = new Set<InvalidatedArea>();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const flushInvalidations = () => {
      refreshTimer = null;

      if (pendingAreas.has("shipments")) {
        void queryClient.invalidateQueries({ queryKey: ["shipments"] });
        void queryClient.invalidateQueries({
          queryKey: shipmentId ? ["shipment", shipmentId] : ["shipment"],
        });
      }
      if (pendingAreas.has("history")) {
        void queryClient.invalidateQueries({
          queryKey: shipmentId
            ? ["shipment-status-history", shipmentId]
            : ["shipment-status-history"],
        });
      }
      if (pendingAreas.has("evidences")) {
        void queryClient.invalidateQueries({
          queryKey: shipmentId
            ? ["shipment-evidences", shipmentId]
            : ["shipment-evidences"],
        });
      }
      if (pendingAreas.has("attachments")) {
        void queryClient.invalidateQueries({
          queryKey: shipmentId
            ? ["shipment-attachments", shipmentId]
            : ["shipment-attachments"],
        });
      }

      pendingAreas.clear();
    };

    const scheduleInvalidation = (area: InvalidatedArea) => {
      pendingAreas.add(area);
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(flushInvalidations, 300);
    };

    const shipmentChanges = shipmentId
      ? {
          event: "*" as const,
          schema: "public",
          table: "shipments",
          filter: `id=eq.${shipmentId}`,
        }
      : { event: "*" as const, schema: "public", table: "shipments" };

    const historyChanges = shipmentId
      ? {
          event: "*" as const,
          schema: "public",
          table: "shipment_status_history",
          filter: `shipment_id=eq.${shipmentId}`,
        }
      : {
          event: "*" as const,
          schema: "public",
          table: "shipment_status_history",
        };

    const channel = supabase
      .channel(`shipments-realtime-${shipmentId ?? "list"}`)
      .on("postgres_changes", shipmentChanges, () => scheduleInvalidation("shipments"))
      .on("postgres_changes", historyChanges, () => scheduleInvalidation("history"));

    if (includeShipmentFiles) {
      const evidenceChanges = {
        event: "*" as const,
        schema: "public",
        table: "shipment_evidences",
        ...(shipmentId ? { filter: `shipment_id=eq.${shipmentId}` } : {}),
      };
      const attachmentChanges = {
        event: "*" as const,
        schema: "public",
        table: "shipment_attachments",
        ...(shipmentId ? { filter: `shipment_id=eq.${shipmentId}` } : {}),
      };

      channel
        .on("postgres_changes", evidenceChanges, () => scheduleInvalidation("evidences"))
        .on("postgres_changes", attachmentChanges, () => scheduleInvalidation("attachments"));
    }

    channel.subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      pendingAreas.clear();
      void supabase.removeChannel(channel);
    };
  }, [includeShipmentFiles, queryClient, shipmentId]);
}