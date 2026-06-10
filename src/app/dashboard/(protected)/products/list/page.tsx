"use client";

import { useState } from "react";

import { useRouter }
from "next/navigation";

import { ProductsTable }
from "@/modules/products/components/products-table";

import { useProducts }
from "@/modules/products/hooks/use-products";

export default function ProductsListPage() {

  const router =
    useRouter();

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

      <div className="
        flex
        justify-between
        items-center
        mb-6
      ">

        <h1 className="
          text-2xl
          font-bold
        ">
          Productos
        </h1>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/products/new",
            )
          }
          className="
            bg-blue-600
            text-white
            px-4
            py-2
            rounded-lg
          "
        >
          Nuevo producto
        </button>

      </div>

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