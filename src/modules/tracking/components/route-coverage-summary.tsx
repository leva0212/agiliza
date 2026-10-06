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
  const configuredCoverage = coverage.filter((route) => route.visitDays.length > 0 || route.minHours !== null);
  if (!configuredCoverage.length) {
    return null;
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-2 rounded-xl border border-blue-900/15 bg-blue-950/[0.04] p-3 dark:border-sky-800/40 dark:bg-blue-950/30"}>
      {!compact && <p className="text-sm font-semibold text-blue-950 dark:text-sky-100">Cobertura y plazo configurados</p>}
      {configuredCoverage.map((route) => (
        <article key={`${route.districtId}:${route.routeId}`} className="rounded-lg border border-blue-900/10 bg-blue-950/[0.03] px-2.5 py-2 text-xs dark:border-sky-900/40 dark:bg-blue-950/25">
          {route.visitDays.length > 0 && <p className="text-slate-600 dark:text-slate-300"><strong>Se visita:</strong> {formatDays(route.visitDays)}</p>}
          {route.minHours !== null && <p className="mt-0.5 text-slate-600 dark:text-slate-300">{formatDeliveryTime(route)}</p>}
        </article>
      ))}
    </div>
  );
}
