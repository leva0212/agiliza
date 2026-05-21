"use client";

import { useMemo, useState } from "react";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useRouter } from "next/navigation";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { UiMessage } from "@/shared/components/ui-message";

import { deleteRoute } from "@/modules/routes/api/delete-route";
import { useRoutes } from "@/modules/routes/hooks/use-routes";

type RouteItem = {
  id: string;

  name: string;

  estimated_hours: number;

  active: boolean;
};

export default function RoutesListPage() {
  const router = useRouter();

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

      /*{
        accessorKey: "estimated_hours",

        header: "Tiempo estimado",

        Cell: ({ cell }) => {
          const hours = cell.getValue<number>();

          if (hours === 0) {
            return "Cronograma";
          }

          return `${hours} horas`;
        },
      },*/

      {
        accessorKey: "active",

        header: "Estado",

        Cell: ({ cell }) => (cell.getValue<boolean>() ? "Activa" : "Inactiva"),
      },
    ],
    [],
  );

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="card-soft">
        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión de Rutas</h1>

            <p className="text-sm text-gray-500">
              Consulte, edite o elimine rutas existentes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/routes")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nueva Ruta
          </button>
        </div>

        {/* TABLE */}

        <MaterialReactTable
          columns={columns}
          localization={MRT_Localization_ES}
          data={routesResponse?.data || []}
          rowCount={routesResponse?.total || 0}
          enableRowActions
          positionActionsColumn="last"
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
            <div className="flex gap-2">
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
