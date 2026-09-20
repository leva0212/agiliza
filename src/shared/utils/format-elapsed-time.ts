export function formatElapsedTime(value: string) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1_000),
  );

  if (elapsedSeconds < 60) return "hace unos segundos";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `hace ${elapsedMinutes} ${elapsedMinutes === 1 ? "minuto" : "minutos"}`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `hace ${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 30) return `hace ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`;

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return `hace ${elapsedMonths} ${elapsedMonths === 1 ? "mes" : "meses"}`;

  const elapsedYears = Math.floor(elapsedMonths / 12);
  return `hace ${elapsedYears} ${elapsedYears === 1 ? "año" : "años"}`;
}
