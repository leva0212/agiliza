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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-0 py-3 sm:p-6">
      <AppBarActions>
        <AppBarActionLink href="/dashboard/companies" label="Nueva empresa">
          <Plus size={20} />
        </AppBarActionLink>
      </AppBarActions>

      {isLoading ? (
        <div className="px-3 py-6 sm:px-0">Cargando empresas...</div>
      ) : (
        <CompaniesTable
          data={data?.data ?? []}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={data?.total ?? 0}
        />
      )}
    </div>
  );
}
