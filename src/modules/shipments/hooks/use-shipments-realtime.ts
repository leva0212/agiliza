"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

type InvalidatedArea =
  | "shipments"
  | "items"
  | "contacts"
  | "history"
  | "evidences"
  | "attachments";

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
      if (pendingAreas.has("items") && shipmentId) {
        void queryClient.invalidateQueries({ queryKey: ["shipment-items", shipmentId] });
      }
      if (pendingAreas.has("contacts") && shipmentId) {
        void queryClient.invalidateQueries({ queryKey: ["shipment-contact-methods", shipmentId] });
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
          filter: "id=eq." + shipmentId,
        }
      : { event: "*" as const, schema: "public", table: "shipments" };

    const historyChanges = shipmentId
      ? {
          event: "*" as const,
          schema: "public",
          table: "shipment_status_history",
          filter: "shipment_id=eq." + shipmentId,
        }
      : {
          event: "*" as const,
          schema: "public",
          table: "shipment_status_history",
        };

    const channel = supabase
      .channel("shipments-realtime-" + (shipmentId ?? "list"))
      .on("postgres_changes", shipmentChanges, () => scheduleInvalidation("shipments"))
      .on("postgres_changes", historyChanges, () => scheduleInvalidation("history"));

    if (shipmentId) {
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shipment_items",
            filter: "shipment_id=eq." + shipmentId,
          },
          () => scheduleInvalidation("items"),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shipment_contact_methods",
            filter: "shipment_id=eq." + shipmentId,
          },
          () => scheduleInvalidation("contacts"),
        );
    }

    if (includeShipmentFiles) {
      const evidenceChanges = {
        event: "*" as const,
        schema: "public",
        table: "shipment_evidences",
        ...(shipmentId ? { filter: "shipment_id=eq." + shipmentId } : {}),
      };
      const attachmentChanges = {
        event: "*" as const,
        schema: "public",
        table: "shipment_attachments",
        ...(shipmentId ? { filter: "shipment_id=eq." + shipmentId } : {}),
      };

      channel
        .on("postgres_changes", evidenceChanges, () => scheduleInvalidation("evidences"))
        .on("postgres_changes", attachmentChanges, () => scheduleInvalidation("attachments"));
    }

    const refreshWhenVisible = () => {
      if (!shipmentId || document.visibilityState !== "visible") return;
      scheduleInvalidation("shipments");
      scheduleInvalidation("items");
      scheduleInvalidation("contacts");
      scheduleInvalidation("history");
      if (includeShipmentFiles) {
        scheduleInvalidation("evidences");
        scheduleInvalidation("attachments");
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    channel.subscribe((status, error) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("No se pudo mantener Realtime para el envío", {
          shipmentId,
          status,
          error,
        });
      }
    });

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      pendingAreas.clear();
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [includeShipmentFiles, queryClient, shipmentId]);
}
