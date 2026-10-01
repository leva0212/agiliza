"use client";

import { toast } from "sonner";

export async function copyTemporaryPassword(password: string) {
  try {
    await navigator.clipboard.writeText(password);
    toast.success("Contraseña temporal copiada al portapapeles");
  } catch {
    toast.error("No se pudo copiar la contraseña temporal. Puedes mostrarla y copiarla manualmente.");
  }
}
