export async function deleteRoute(routeId: string, successorRouteId: string | null = null) {
  const response = await fetch(`/api/routes/${routeId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ successorRouteId }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No fue posible eliminar la ruta.");
}