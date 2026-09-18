"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";

import { ProductsTable }
from "@/modules/products/components/products-table";

import { useProducts }
from "@/modules/products/hooks/use-products";

export default function ProductsListPage() {

  const [
    pagination,
    setPagination,
  ] = useState({

    pageIndex: 0,

    pageSize: 50,

  });

  const {
    data = [],

    isLoading,

    error,
  } =
    useProducts();

  if (error) {

    return (

      <div className="p-6">

        Error al cargar productos

      </div>

    );

  }

  return (

    <div className="p-6 max-w-[1000px]">

      <AppBarActions>
        <AppBarActionLink href="/dashboard/products/new" label="Nuevo producto">
          <Plus size={20} />
        </AppBarActionLink>
      </AppBarActions>

      {isLoading ? (

        <div>
          Cargando...
        </div>

      ) : (

        <ProductsTable
          data={data}
          pagination={pagination}
          setPagination={
            setPagination
          }
          totalRows={
            data.length
          }
        />

      )}

    </div>

  );

}