"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  AppBarActionLink,
  AppBarActions,
} from "@/shared/components/app-bar-actions";
import { UiMessage } from "@/shared/components/ui-message";
import { ProductsTable } from "@/modules/products/components/products-table";
import { useProducts } from "@/modules/products/hooks/use-products";
import { deleteProduct } from "@/modules/products/api/delete-product";
import type { Product } from "@/modules/products/types/product";

export default function ProductsListPage() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const { data = [], isLoading, error } = useProducts();

  if (error) {
    return <div className="p-6">Error al cargar productos</div>;
  }

  return (
    <div className="w-full max-w-[1000px] px-0 py-3 sm:p-6">
      <AppBarActions>
        <AppBarActionLink href="/dashboard/products/new" label="Nuevo producto">
          <Plus size={20} />
        </AppBarActionLink>
      </AppBarActions>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <ProductsTable
          data={data}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={data.length}
          onDelete={setProductToDelete}
        />
      )}

      <UiMessage
        open={!!productToDelete}
        title="Eliminar producto"
        type="danger"
        confirmText="Eliminar producto"
        message={
          <>
            ¿Deseas eliminar <strong>{productToDelete?.name}</strong>? Esta
            acción no se puede deshacer. Si el producto tiene envíos o
            inventario asociados, se impedirá eliminarlo para conservar la
            trazabilidad.
          </>
        }
        onClose={() => setProductToDelete(null)}
        onConfirm={async () => {
          if (!productToDelete) return;

          try {
            await deleteProduct(productToDelete.id);

            setProductToDelete(null);

            await queryClient.invalidateQueries({
              queryKey: ["products"],
            });
          } catch (error: any) {
            setProductToDelete(null);

            setDeleteError(
              error?.code === "23503"
                ? "Este producto ya tiene envíos, inventario u otros registros asociados. Desactívalo en lugar de eliminarlo para conservar la trazabilidad."
                : "No fue posible eliminar el producto. Inténtalo nuevamente.",
            );
          }
        }}
      />

      <UiMessage
        open={!!deleteError}
        title="No se puede eliminar"
        type="warning"
        message={deleteError}
        onClose={() => setDeleteError("")}
      />
    </div>
  );
}
