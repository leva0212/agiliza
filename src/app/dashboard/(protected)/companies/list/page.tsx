"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useCompanies } from "@/modules/companies/hooks/use-companies";

import { CompaniesTable } from "@/modules/companies/components/companies-table";

import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";

export default function CompaniesListPage() {
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
      <AppBarActions>
        <AppBarActionLink href="/dashboard/companies" label="Nueva empresa">
          <Plus size={20} />
        </AppBarActionLink>
      </AppBarActions>

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
