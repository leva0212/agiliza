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
    "bg-violet-50 border-violet-200 text-violet-700",
},

  {
    value: "delivered",
    label: "Entregado",
    icon: CheckCircle2,
    className:
      "bg-green-50 border-green-200 text-green-700",
  },

  {
    value: "failed_attempt",
    label: "Intento fallido",
    icon: XCircle,
    className:
      "bg-red-50 border-red-200 text-red-700",
  },

  {
    value: "in_route",
    label: "En ruta",
    icon: Truck,
    className:
      "bg-blue-50 border-blue-200 text-blue-700",
  },

  {
    value: "assigned",
    label: "Asignado",
    icon: PackageCheck,
    className:
      "bg-sky-50 border-sky-200 text-sky-700",
  },

  {
    value: "rejected",
    label: "Rechazado",
    icon: Ban,
    className:
      "bg-red-50 border-red-200 text-red-700",
  },

  {
    value: "cancelled",
    label: "Cancelado",
    icon: Ban,
    className:
      "bg-orange-50 border-orange-200 text-orange-700",
  },

] as const;