import type { ShipmentEvidence } from "../types/shipment-evidence";

export async function getShipmentEvidences(
  shipmentId: string,
): Promise<ShipmentEvidence[]> {
  const response = await fetch(
    `/api/shipments/${encodeURIComponent(shipmentId)}/evidences`,
    { cache: "no-store" },
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "No fue posible cargar las evidencias");
  }

  return payload.data ?? [];
}