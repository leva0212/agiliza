"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import type { PaginationState } from "@tanstack/react-table";

import { getShipments } from "@/modules/shipments/api/get-shipments";

import { ShipmentsTable } from "@/modules/shipments/components/shipments-table";
import { useShipmentsRealtime } from "@/modules/shipments/hooks/use-shipments-realtime";
export default function ShipmentsListPage() {
  const router = useRouter();
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
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Envíos</h1>

        <button
          type="button"
          onClick={() => router.push("/dashboard/shipments")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Nuevo envío
        </button>
      </div>
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
