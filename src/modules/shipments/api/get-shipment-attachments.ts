import type { ShipmentAttachment } from "../types/shipment-attachment";

export async function getShipmentAttachments(
  shipmentId: string,
): Promise<ShipmentAttachment[]> {
  const response = await fetch(
    `/api/shipments/${encodeURIComponent(shipmentId)}/attachments`,
    { cache: "no-store" },
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "No fue posible cargar los adjuntos");
  }

  return payload.data ?? [];
}