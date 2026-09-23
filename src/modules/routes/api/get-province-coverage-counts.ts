export async function getProvinceCoverageCounts(

  provinceName: string

) {
  const response = await fetch(
    `/api/coverage/province?province=${encodeURIComponent(provinceName)}`,
    { cache: "no-store" },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No fue posible consultar la cobertura.");
  }

  return data;
}