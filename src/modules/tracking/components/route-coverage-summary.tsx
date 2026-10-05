import type { DistrictRouteCoverage } from "@/modules/routes/api/get-district-route-coverage";

const dayLabels: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const dayOrder = Object.keys(dayLabels);

function formatDays(days: string[]) {
  const knownDays = [...new Set(days)].sort((first, second) => dayOrder.indexOf(first) - dayOrder.indexOf(second));
  return knownDays.length ? knownDays.map((day) => dayLabels[day] ?? day).join(", ") : "Sin días configurados";
}

function formatDeliveryTime(coverage: DistrictRouteCoverage) {
  if (coverage.minHours === 0) return "Entrega según cronograma";
  if (coverage.minHours === null) return "Entrega sin plazo configurado";
  if (!coverage.maxHours || coverage.maxHours === coverage.minHours) return `Entrega en: ${coverage.minHours} horas`;
  return `Entrega en: ${coverage.minHours} a ${coverage.maxHours} horas`;
}

type Props = {
  coverage: DistrictRouteCoverage[];
  compact?: boolean;
};

/** Muestra cada ruta por separado para no mezclar días ni plazos entre rutas. */
export function RouteCoverageSummary({ coverage, compact = false }: Props) {
  if (!coverage.length) {
    return <span className="text-sm text-slate-500 dark:text-slate-400">Sin cobertura configurada</span>;
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-2 rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900 dark:bg-sky-950/25"}>
      {!compact && <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">Cobertura y plazo configurados</p>}
      {coverage.map((route) => (
        <article key={`${route.districtId}:${route.routeId}`} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300"><strong>Visita:</strong> {formatDays(route.visitDays)}</p>
          <p className="mt-0.5 text-slate-600 dark:text-slate-300">{formatDeliveryTime(route)}</p>
        </article>
      ))}
    </div>
  );
}
