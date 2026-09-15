"use client";

import { useQuery } from "@tanstack/react-query";
import { getShipmentAttachments } from "../api/get-shipment-attachments";

export function useShipmentAttachments(shipmentId: string) {
  return useQuery({
    queryKey: ["shipment-attachments", shipmentId],
    queryFn: () => getShipmentAttachments(shipmentId),
    staleTime: 1000 * 60 * 5,
  });
}
