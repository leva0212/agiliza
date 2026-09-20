"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { customerLocationSchema } from "../utils/customer-location-schema";
import { usePageCloseGuard } from "@/shared/components/page-close-guard";

type Props = {
  shipmentId: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function CustomerLocationEditor({ shipmentId, latitude, longitude }: Props) {
  const [editing, setEditing] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  usePageCloseGuard(editing);
  const hasLocation = latitude != null && longitude != null;
  const mutation = useMutation({
    mutationFn: async (coordinates: { latitude: number; longitude: number }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/customer-location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coordinates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "No fue posible guardar la ubicación.");
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] }),
        queryClient.invalidateQueries({ queryKey: ["shipments"] }),
      ]);
      setEditing(false);
      toast.success("Ubicación guardada para el mensajero.");
    },
    onError: (failure: Error) => setError(failure.message),
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const parsed = customerLocationSchema.safeParse({
      latitude: latitudeInput.trim() ? Number(latitudeInput.trim().replace(",", ".")) : NaN,
      longitude: longitudeInput.trim() ? Number(longitudeInput.trim().replace(",", ".")) : NaN,
    });
    if (!parsed.success) {
      setError("Ingrese una latitud entre -90 y 90 y una longitud entre -180 y 180.");
      return;
    }
    setError("");
    mutation.mutate(parsed.data);
  }

  if (!editing) return (
    <button type="button" onClick={() => {
      setLatitudeInput(latitude?.toString() ?? "");
      setLongitudeInput(longitude?.toString() ?? "");
      setError("");
      setEditing(true);
    }} className="inline-flex items-center gap-2 rounded-lg border border-sky-300 px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-900">
      <Pencil size={16} />{hasLocation ? "Modificar ubicación" : "Ingresar coordenadas"}
    </button>
  );

  return (
    <form onSubmit={save} className="w-full space-y-3 rounded-lg border border-sky-200 p-3 dark:border-sky-800">
      <p className="text-sm text-slate-600 dark:text-slate-300">Ingresa las coordenadas proporcionadas por el cliente. Al guardar se actualizará la ubicación disponible para el mensajero.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Latitud
          <input autoFocus required type="text" inputMode="decimal" value={latitudeInput} onChange={(event) => setLatitudeInput(event.target.value)} disabled={mutation.isPending} placeholder="Ej.: 9.928069" className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
        <label className="text-sm font-medium">Longitud
          <input required type="text" inputMode="decimal" value={longitudeInput} onChange={(event) => setLongitudeInput(event.target.value)} disabled={mutation.isPending} placeholder="Ej.: -84.090725" className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-green-800 px-3 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50">{mutation.isPending ? "Guardando…" : "Guardar ubicación"}</button>
        <button type="button" disabled={mutation.isPending} onClick={() => setEditing(false)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Cancelar</button>
      </div>
    </form>
  );
}
