"use client";

import { Plus } from "lucide-react";
import { useState, useEffect } from "react";


import { useQuery } from "@tanstack/react-query";

import type { PaginationState } from "@tanstack/react-table";

import { getShipments } from "@/modules/shipments/api/get-shipments";

import { ShipmentsTable } from "@/modules/shipments/components/shipments-table";
import { useShipmentsRealtime } from "@/modules/shipments/hooks/use-shipments-realtime";
import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";
export default function ShipmentsListPage() {
  useShipmentsRealtime();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,

    pageSize: 20,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);
  const [status, setStatus] = useState("");

  const {
    data,

    isLoading,
  } = useQuery({
    queryKey: [
      "shipments",
      pagination.pageIndex,
      pagination.pageSize,
      status,
      debouncedSearch,
    ],

    queryFn: () =>
      getShipments({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: status || undefined,
        search: debouncedSearch.trim() || undefined,
      }),
  });

  return (
    <div className="mx-auto w-full max-w-[1000px] px-0 py-3 sm:p-6">
      <AppBarActions>
        <AppBarActionLink href="/dashboard/shipments" label="Nuevo envío">
          <Plus size={20} />
        </AppBarActionLink>
      </AppBarActions>
      <div
        className="
    mb-4
    flex
    gap-3
    flex-wrap
  "
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="# guía, cliente, teléfono, identificación"
          title="Buscar por número de guía, nombre del cliente, número de teléfono, número de identificación"
          className="border rounded-lg px-1 py-2 min-w-[200px] max-w-[200px]"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="
      border
      rounded-lg
      px-3
      py-2 max-w-[200px]
    "
        >
          <option value="">Todos los estados</option>

          <option value="created">Creado</option>

          <option value="assigned">Asignado</option>

          <option value="in_route">En ruta</option>

          <option value="delivered">Entregado</option>

          <option value="failed_attempt">Intento fallido</option>

          <option value="rejected">Rechazado</option>

          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <ShipmentsTable
          data={data?.data || []}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={data?.total || 0}
        />
      )}
    </div>
  );
}
