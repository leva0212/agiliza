type Input = { routeId: string; districtIds: number[]; minHours: number; maxHours: number; days: string[] };

export async function applyRouteBulkSchedule(input: Input) {
  const response = await fetch(`/api/routes/${input.routeId}/bulk-schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No fue posible aplicar la configuración masiva.");
  return data as { updatedDistricts: number };
}