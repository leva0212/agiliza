export async function setRouteActive(routeId: string, active: boolean) {
  const response = await fetch(`/api/routes/${routeId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No fue posible actualizar la ruta.");
  return data as { id: string; name: string; active: boolean };
}