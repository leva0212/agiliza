import {
  Ban,
  CheckCircle2,
  PackageCheck,
  Truck,
  Sparkles,
  XCircle,
} from "lucide-react";

export const shipmentStatusOptions = [
  {
  value: "created",
  label: "Creado",
  icon: Sparkles,
  className:
    "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/55 dark:border-violet-700/70 dark:text-violet-200 dark:hover:bg-violet-900/70",
},

  {
    value: "delivered",
    label: "Entregado",
    icon: CheckCircle2,
    className:
      "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950/55 dark:border-green-700/70 dark:text-green-200 dark:hover:bg-green-900/70",
  },

  {
    value: "failed_attempt",
    label: "Intento fallido",
    icon: XCircle,
    className:
      "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/55 dark:border-red-700/70 dark:text-red-200 dark:hover:bg-red-900/70",
  },

  {
    value: "in_route",
    label: "En ruta",
    icon: Truck,
    className:
      "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/55 dark:border-blue-700/70 dark:text-blue-200 dark:hover:bg-blue-900/70",
  },

  {
    value: "assigned",
    label: "Asignado",
    icon: PackageCheck,
    className:
      "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/55 dark:border-sky-700/70 dark:text-sky-200 dark:hover:bg-sky-900/70",
  },

  {
    value: "rejected",
    label: "Rechazado",
    icon: Ban,
    className:
      "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/55 dark:border-red-700/70 dark:text-red-200 dark:hover:bg-red-900/70",
  },

  {
    value: "cancelled",
    label: "Cancelado",
    icon: Ban,
    className:
      "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/55 dark:border-orange-700/70 dark:text-orange-200 dark:hover:bg-orange-900/70",
  },

] as const;