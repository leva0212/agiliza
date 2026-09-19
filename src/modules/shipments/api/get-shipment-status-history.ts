import type { ShipmentStatus } from "../types/shipment";

export type ShipmentStatusHistoryEntry = {
  id: string;
  shipment_id: string;
  previous_status: ShipmentStatus | null;
  status: ShipmentStatus;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  profile: {
    id: string;
    full_name: string;
    company_id: string | null;
  } | null;
};
export async function getShipmentStatusHistory(
  shipmentId: string,
): Promise<ShipmentStatusHistoryEntry[]> {
  const response = await fetch(
    `/api/shipments/${encodeURIComponent(shipmentId)}/status-history`,
    { cache: "no-store" },
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message ?? "No fue posible cargar el historial del envío",
    );
  }

  return payload.data ?? [];
}