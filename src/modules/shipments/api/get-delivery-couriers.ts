import type { DeliveryCourier } from "../types/delivery-courier";

export async function getDeliveryCouriers(): Promise<DeliveryCourier[]> {
  const response = await fetch("/api/delivery-couriers", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    data?: DeliveryCourier[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "No fue posible cargar los mensajeros");
  }

  return payload.data ?? [];
}
