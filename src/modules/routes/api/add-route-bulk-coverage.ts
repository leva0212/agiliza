export async function addRouteBulkCoverage(routeId: string, districtIds: number[], neighborhoodIds: number[] = [], action: "add" | "remove" = "add") {
 const response = await fetch(`/api/routes/${routeId}/bulk-coverage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ districtIds, neighborhoodIds, action }) });
 const data = await response.json(); if (!response.ok) throw new Error(data.message || "No fue posible agregar cobertura."); return data as { added_neighborhoods?: number; removed_neighborhoods?: number; affected_districts: number };
}