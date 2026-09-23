"use client";

import { standardMrtFeatures } from "@/shared/config/material-react-table";

import { RouteCouriersDialog } from "@/modules/courier-routes/components/route-couriers-dialog";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";

import { Motorbike, Plus } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useRouter } from "next/navigation";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";
import { UiMessage } from "@/shared/components/ui-message";

import { deleteRoute } from "@/modules/routes/api/delete-route";
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

  async function handleDelete() {
    if (!routeToDelete) {
      return;
    }

    try {
      await deleteRoute(routeToDelete);

      await refetch();

      setUiMessage({
        open: true,

        type: "success",

        title: "Ruta eliminada",

        message: "La ruta fue eliminada correctamente.",
      });
    } catch (error) {
      console.error(error);

      setUiMessage({
        open: true,

        type: "error",

        title: "Error",

        message: "No fue posible eliminar la ruta.",
      });
    } finally {
      setRouteToDelete(null);
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
              {/* EDITAR */}

              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/routes?id=${row.original.id}`)
                }
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Editar
              </button>

              {/* ELIMINAR */}

              <button
                type="button"
                onClick={() => {
                  setRouteToDelete(row.original.id);

                  setUiMessage({
                    open: true,

                    type: "question",

                    title: "Eliminar ruta",

                    message: "¿Desea eliminar esta ruta?",
                  });
                }}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Eliminar
              </button>
            </div>
          )}
        />
      </div>

      {assignmentRoute && <RouteCouriersDialog key={assignmentRoute.id} route={assignmentRoute} onClose={() => setAssignmentRoute(null)} />}

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
          await handleDelete();

          setUiMessage((prev) => ({
            ...prev,

            open: false,
          }));
        }}
      />
    </div>
  );
}
