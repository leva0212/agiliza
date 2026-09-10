export const trackingStatusOptions = [
  {
    value: "ENTREGADO",
    label: "Entregado",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "EN RUTA",
    label: "En ruta",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "CANCELADA DTS",
    label: "Cancelada DTS",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "SIN COBERTURA",
    label: "Sin cobertura",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "RECHAZADA POR CTE",
    label: "Rechazada por CTE",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "ILOCALIZABLE 1",
    label: "Ilocalizable 1",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "ILOCALIZABLE 2",
    label: "Ilocalizable 2",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "INTENTO FALLIDO",
    label: "Intento fallido",
    className: "bg-red-100 text-red-800 border-red-200",
  },
] as const;

export type TrackingStatus =
  (typeof trackingStatusOptions)[number]["value"];
