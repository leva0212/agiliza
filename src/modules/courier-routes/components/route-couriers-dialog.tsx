"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import { getRouteCouriers, saveAssignments, type AssignmentEditorData } from "../api/assignment-management";

type Props = { route: { id: string; name: string; active: boolean }; onClose: () => void };

export function RouteCouriersDialog({ route, onClose }: Props) {
  const [saving, setSaving] = useState(false);
  const query = useQuery({
    queryKey: ["route-couriers", route.id], queryFn: () => getRouteCouriers(route.id),
    staleTime: 0, gcTime: 0, refetchOnWindowFocus: false,
  });
  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="route-couriers-title">
      <DialogTitle id="route-couriers-title">Mensajeros de {route.name}</DialogTitle>
      {query.isPending ? <DialogContent>Cargando asignaciones…</DialogContent>
        : query.isError ? <DialogContent><Alert severity="error">No fue posible cargar las asignaciones.</Alert><Button onClick={() => void query.refetch()}>Reintentar</Button><Button onClick={onClose}>Cerrar</Button></DialogContent>
        : <AssignmentForm key={query.dataUpdatedAt} data={query.data} route={route} onClose={onClose} onReload={() => void query.refetch()} saving={saving} setSaving={setSaving} />}
    </Dialog>
  );
}

function AssignmentForm({ data, route, onClose, onReload, saving, setSaving }: Props & {
  data: AssignmentEditorData; onReload: () => void; saving: boolean; setSaving: (value: boolean) => void;
}) {
  const [selected, setSelected] = useState(data.selectedIds);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const dirty = [...selected].sort().join() !== [...data.selectedIds].sort().join();
  const filtered = data.options.filter((option) => (option.active || data.selectedIds.includes(option.id)) && option.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  async function save() {
    setSaving(true);
    setError("");
    try {
      await saveAssignments("route", route.id, selected, data.selectedIds);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["route-couriers", route.id], refetchType: "none" }),
        queryClient.invalidateQueries({ queryKey: ["courier-routes"] }),
        queryClient.invalidateQueries({ queryKey: ["routes"] }),
      ]);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No fue posible guardar las asignaciones.");
    } finally { setSaving(false); }
  }
  return <>
    <DialogContent dividers>
      <p className="mb-3 text-sm">Puedes asignar varios mensajeros. Los cambios no reasignan los envíos existentes.</p>
      {!route.active && <Alert severity="info" sx={{ mb: 2 }}>Ruta inactiva: puedes conservar o retirar asignaciones, pero no agregar nuevas.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}<Button disabled={saving} onClick={onReload}>Recargar asignaciones</Button></Alert>}
      <TextField fullWidth size="small" label="Buscar mensajero" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="mt-3 flex flex-col">
        {filtered.map((option) => (
          <FormControlLabel key={option.id} label={`${option.name}${option.active ? "" : " (inactivo o no habilitado)"}`} control={<Checkbox
            checked={selected.includes(option.id)}
            disabled={saving || ((!route.active || !option.active) && !data.selectedIds.includes(option.id))}
            onChange={(_, checked) => setSelected((previous) => checked ? [...previous, option.id] : previous.filter((id) => id !== option.id))}
          />} />
        ))}
        {filtered.length === 0 && <p className="py-4 text-sm">No hay mensajeros disponibles con este filtro.</p>}
      </div>
      <p className="mt-3 text-sm text-slate-500">{selected.length} mensajero(s) seleccionado(s). Desactivar conserva los vínculos; desvincular los elimina.</p>
    </DialogContent>
    <DialogActions sx={{ gap: 1, p: 2 }}>
      <Button disabled={saving} onClick={onClose}>Cancelar</Button>
      <Button variant="contained" disabled={saving || !dirty} onClick={() => void save()}>{saving ? "Guardando…" : "Guardar asignaciones"}</Button>
    </DialogActions>
  </>;
}
