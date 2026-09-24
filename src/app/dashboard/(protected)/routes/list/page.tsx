"use client";

import { standardMrtFeatures } from "@/shared/config/material-react-table";

import { RouteCouriersDialog } from "@/modules/courier-routes/components/route-couriers-dialog";
import { RouteDeleteDialog } from "@/modules/routes/components/route-delete-dialog";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";

import { Motorbike, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useRouter } from "next/navigation";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";
import { UiMessage } from "@/shared/components/ui-message";

import { deleteRoute } from "@/modules/routes/api/delete-route";
import { getRouteDeletionSummary } from "@/modules/routes/api/get-route-deletion-summary";
import { setRouteActive } from "@/modules/routes/api/set-route-active";
import { useRoutes } from "@/modules/routes/hooks/use-routes";

type RouteItem = {
  id: string;

  name: string;

  estimated_hours: number;

  courier_names: string;

  active: boolean;
};

export default function RoutesListPage() {
  const router = useRouter();
  const { data: profile } = useCurrentProfile();
  const [assignmentRoute, setAssignmentRoute] = useState<RouteItem | null>(null);

  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string; rateCount: number; shipmentCount: number } | null>(null);
  const [routeToToggle, setRouteToToggle] = useState<RouteItem | null>(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,

    pageSize: 20,
  });

  const [uiMessage, setUiMessage] = useState({
    open: false,

    type: "info" as "success" | "error" | "warning" | "info" | "question",

    title: "",

    message: "",
  });

  // SERVER FETCH

  const {
    data: routesResponse,

    isLoading,

    refetch,
  } = useRoutes(
    pagination.pageIndex,

    pagination.pageSize,
  );

  async function requestDelete(route: RouteItem) {
    try {
      const summary = await getRouteDeletionSummary(route.id);
      setDeleteDialog({ id: route.id, name: route.name, rateCount: summary.courierDeliveryRates, shipmentCount: summary.shipments });
    } catch (error) {
      setUiMessage({
        open: true,
        type: "error",
        title: "No fue posible revisar la ruta",
        message: error instanceof Error ? error.message : "Intente nuevamente.",
      });
    }
  }
  async function handleDelete(routeId: string | null, successorRouteId: string | null = null) {
    if (!routeId) return;

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[Routes] Solicitud de eliminación iniciada", { routeId, successorRouteId });
      }

      await deleteRoute(routeId, successorRouteId);
      await refetch();

      setUiMessage({
        open: true,
        type: "success",
        title: "Ruta eliminada",
        message: "La ruta fue eliminada correctamente.",
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Routes] Error al eliminar ruta", { routeId, successorRouteId, error });
      }

      setUiMessage({
        open: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "No fue posible eliminar la ruta.",
      });
    } finally {
      setRouteToDelete(null);
    }
  }
  async function handleToggleActive() {
    if (!routeToToggle) return;

    try {
      const route = await setRouteActive(routeToToggle.id, !routeToToggle.active);
      await refetch();
      setUiMessage({
        open: true,
        type: "success",
        title: route.active ? "Ruta activada" : "Ruta desactivada",
        message: route.active
          ? "La ruta vuelve a participar en la cobertura y en los envíos nuevos."
          : "La configuración se conserva, pero la ruta deja de participar en la cobertura y en los envíos nuevos.",
      });
    } catch (error) {
      setUiMessage({ open: true, type: "error", title: "No fue posible actualizar la ruta", message: error instanceof Error ? error.message : "Intente nuevamente." });
    } finally {
      setRouteToToggle(null);
    }
  }
  const columns = useMemo<MRT_ColumnDef<RouteItem>[]>(
    () => [
      {
        accessorKey: "name",

        header: "Ruta",
      },


      {
        accessorKey: "courier_names",
        header: "Mensajeros asociados",
        size: 300,
        Cell: ({ cell }) => cell.getValue<string>() || "Sin mensajeros asignados",
      },
      {
        accessorKey: "active",

        header: "Estado",

        Cell: ({ cell }) => (cell.getValue<boolean>() ? "Activa" : "Inactiva"),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-3 sm:p-6 animate-fade-in">
      <div className="card-soft mobile-table-card">
        <AppBarActions>
          <AppBarActionLink href="/dashboard/routes" label="Nueva ruta" tone="success">
            <Plus size={20} />
          </AppBarActionLink>
        </AppBarActions>

        <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
          Consulte, edite o elimine rutas existentes.
        </p>
        {/* TABLE */}

        <MaterialReactTable
          {...standardMrtFeatures}
          columns={columns}
          localization={MRT_Localization_ES}
          data={routesResponse?.data || []}
          rowCount={routesResponse?.total || 0}
          enableRowActions
          positionActionsColumn="last"
          displayColumnDefOptions={{
            ...standardMrtFeatures.displayColumnDefOptions,
            "mrt-row-actions": {
              ...standardMrtFeatures.displayColumnDefOptions["mrt-row-actions"],
              size: 260,
              minSize: 260,
            },
          }}
          pageCount={Math.ceil(
  (routesResponse?.total || 0) /
  pagination.pageSize
)}
          manualPagination
          onPaginationChange={setPagination}
          state={{
            pagination,

            isLoading,
          }}
          renderRowActions={({ row }) => (
            <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
              {profile?.active && profile.role === "super_admin" && (
                <Tooltip title="Asignar mensajeros" arrow>
                  <IconButton
                    aria-label={`Asignar mensajeros a ${row.original.name}`}
                    onClick={() => setAssignmentRoute(row.original)}
                    color="success"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "success.main",
                      bgcolor: "action.hover",
                      "&:hover": { bgcolor: "action.selected" },
                    }}
                  >
                    <Motorbike size={22} />
                  </IconButton>
                </Tooltip>
              )}
              {profile?.active && profile.role === "super_admin" && (
                <Tooltip title={row.original.active ? "Desactivar ruta" : "Activar ruta"} arrow>
                  <IconButton
                    aria-label={row.original.active ? `Desactivar ${row.original.name}` : `Activar ${row.original.name}`}
                    onClick={() => {
                      setRouteToToggle(row.original);
                      setUiMessage({
                        open: true,
                        type: "question",
                        title: row.original.active ? "Desactivar ruta" : "Activar ruta",
                        message: row.original.active
                          ? "La ruta dejará de contar como cobertura y no se ofrecerá para envíos nuevos. Sus barrios y configuración se conservarán."
                          : "La ruta volverá a contar como cobertura y estará disponible para envíos nuevos.",
                      });
                    }}
                    sx={{ width: 40, height: 40, borderRadius: 2, border: "1px solid", borderColor: row.original.active ? "warning.main" : "success.main", color: row.original.active ? "warning.main" : "success.main", bgcolor: "action.hover", "&:hover": { bgcolor: "action.selected" } }}
                  >
                    <Power size={20} />
                  </IconButton>
                </Tooltip>
              )}
              {/* EDITAR */}

              <Tooltip title="Editar ruta" arrow>
                <IconButton
                  aria-label={`Editar ${row.original.name}`}
                  onClick={() => router.push(`/dashboard/routes?id=${row.original.id}`)}
                  sx={{ width: 40, height: 40, borderRadius: 2, border: "1px solid", borderColor: "primary.main", color: "primary.main", bgcolor: "action.hover", "&:hover": { bgcolor: "action.selected" } }}
                >
                  <Pencil size={20} />
                </IconButton>
              </Tooltip>

              {/* ELIMINAR */}

              <Tooltip title="Eliminar ruta" arrow>
                <IconButton
                  aria-label={`Eliminar ${row.original.name}`}
                  onClick={() => void requestDelete(row.original)}
                  sx={{ width: 40, height: 40, borderRadius: 2, border: "1px solid", borderColor: "error.main", color: "error.main", bgcolor: "action.hover", "&:hover": { bgcolor: "action.selected" } }}
                >
                  <Trash2 size={20} />
                </IconButton>
              </Tooltip>
            </div>
          )}
        />
      </div>

      {assignmentRoute && <RouteCouriersDialog key={assignmentRoute.id} route={assignmentRoute} onClose={() => setAssignmentRoute(null)} />}
      {deleteDialog && <RouteDeleteDialog routeId={deleteDialog.id} routeName={deleteDialog.name} rateCount={deleteDialog.rateCount} shipmentCount={deleteDialog.shipmentCount} onClose={() => setDeleteDialog(null)} onConfirm={async (successorRouteId) => { await handleDelete(deleteDialog.id, successorRouteId); setDeleteDialog(null); }} />}

      {/* MODAL */}

      <UiMessage
        open={uiMessage.open}
        title={uiMessage.title}
        message={uiMessage.message}
        type={uiMessage.type}
        onClose={() =>
          setUiMessage((prev) => ({
            ...prev,

            open: false,
          }))
        }
        onConfirm={async () => {
          if (routeToToggle) {
            await handleToggleActive();
          } else {
            await handleDelete(routeToDelete);
          }

          setUiMessage((prev) => ({
            ...prev,

            open: false,
          }));
        }}
      />
    </div>
  );
}
