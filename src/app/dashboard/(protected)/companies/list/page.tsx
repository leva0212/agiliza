"use client";

import { useState } from "react";

import { useCompanies } from "@/modules/companies/hooks/use-companies";

import { CompaniesTable } from "@/modules/companies/components/companies-table";

import { useRouter } from "next/navigation";

export default function CompaniesListPage() {
  const router = useRouter();

  const [pagination, setPagination] = useState({
    pageIndex: 0,

    pageSize: 50,
  });

  const {
    data,

    isLoading,

    error,
  } = useCompanies(
    pagination.pageIndex,

    pagination.pageSize,
  );

  if (error) {
    return <div className="p-6">Error al cargar empresas</div>;
  }
  console.log("Data de empresas:", data);

  return (
    <div className="p-6 max-w-[900px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Empresas</h1>

        <button
          type="button"
          onClick={() => router.push("/dashboard/companies")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Nueva empresa
        </button>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <CompaniesTable
          data={data?.data || []}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={data?.total || 0}
        />
      )}
    </div>
  );
}
