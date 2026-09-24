export async function getRouteDeletionSummary(routeId: string) {
  const response = await fetch(`/api/routes/${routeId}/deletion-summary`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No fue posible revisar la ruta.");
  return data as { courierDeliveryRates: number; shipments: number };
}