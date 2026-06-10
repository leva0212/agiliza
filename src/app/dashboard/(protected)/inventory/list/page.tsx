"use client";

import { useState } from "react";

import { InventoryTable } from "@/modules/inventory/components/inventory-table";

import { useInventory } from "@/modules/inventory/hooks/use-inventory";
import { SearchSelector } from "@/shared/components/search-selector";

import { CourierSearchDialog } from "@/modules/couriers/components/courier-search-dialog";
import { ProductSearchDialog } from "@/modules/company-products/components/product-search-dialog";
import { CompanySearchDialog } from "@/modules/companies/components/company-search-dialog";
import { UiMessage } from "@/shared/components/ui-message";
import { InventoryMovementsDialog } from "@/modules/inventory/components/inventory-movements-dialog";
import { InventoryAssignDialog } from "@/modules/inventory/components/inventory-assign-dialog";
import { AssignInventoryInput } from "@/modules/inventory/types/assign-inventory";
import { useQueryClient } from "@tanstack/react-query";

import { assignInventory } from "@/modules/inventory/api/assign-inventory";

import { createClient } from "@/lib/supabase/client";
import { READ_ONLY_INPUT_CLASS } from "@/shared/constants/ui";
export default function InventoryListPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageIndex: 0,

    pageSize: 10,
  });
  const [movementInventoryId, setMovementInventoryId] = useState<string | null>(
    null,
  );

  const [useCourierFilter, setUseCourierFilter] = useState(false);

  const [useCompanyFilter, setUseCompanyFilter] = useState(false);

  const [useProductFilter, setUseProductFilter] = useState(false);

  const [movementsOpen, setMovementsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [courierId, setCourierId] = useState("");
  const [courierName, setCourierName] = useState("");

  const [courierDialogOpen, setCourierDialogOpen] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);

  const [productId, setProductId] = useState("");

  const [quantityOperator, setQuantityOperator] = useState("");

  const [quantityValue, setQuantityValue] = useState("");

  const [quantityValue2, setQuantityValue2] = useState("");

  const { data, isLoading, error } = useInventory({
    pageIndex: pagination.pageIndex,

    pageSize: pagination.pageSize,

    courierId: useCourierFilter ? courierId : undefined,

    companyId: useCompanyFilter ? companyId : undefined,

    productId: useProductFilter ? productId : undefined,

    quantityOperator: quantityOperator as any,

    quantityValue: quantityValue ? Number(quantityValue) : undefined,

    quantityValue2: quantityValue2 ? Number(quantityValue2) : undefined,
  });

  if (error) {
    return <div className="p-6">Error al cargar inventario</div>;
  }
  

  return (
    <div className="p-2 space-y-1">
      <h1 className="text-lg font-bold">Inventario</h1>
      {/* ===== INICIO FILTROS INVENTARIO ===== */}

      {/* INICIO FILTROS */}

      <div
        className="
    grid
    grid-cols-1
    md:grid-cols-3
    gap-4
    max-w-[900px]
  "
      >
        {/* INICIO FILTRO MENSAJERO */}

        <div
          className="
      flex
      items-center
      gap-2  border border-blue-200 rounded-lg p-3
    "
        >
          <input
            type="checkbox"
            title="Filtrar por mensajero"
            checked={useCourierFilter}
            onChange={(event) => setUseCourierFilter(event.target.checked)}
            className="
        cursor-help
        w-4
        h-4
      "
          />

          
<div className={`flex-1`}>
            <SearchSelector             
              label="Mensajero"
              valueName={courierName}
              placeholder="Seleccione un mensajero"
              onSearch={() => setCourierDialogOpen(true)}
            />
          </div>
        </div>

        {/* FIN FILTRO MENSAJERO */}

        {/* INICIO FILTRO EMPRESA */}

        <div
          className="
      flex
      items-center
      gap-2  border border-blue-200 rounded-lg p-3
    "
        >
          <input
            type="checkbox"
            title="Filtrar por empresa"
            checked={useCompanyFilter}
            onChange={(event) => setUseCompanyFilter(event.target.checked)}
            className="
        cursor-help
        w-4
        h-4
      "
          />

          <div className={`flex-1  `}>
            <SearchSelector
              label="Empresa"
              valueName={companyName}
              placeholder="Seleccione una empresa"
              onSearch={() => setCompanyDialogOpen(true)}
            />
          </div>
        </div>

        {/* FIN FILTRO EMPRESA */}

        {/* INICIO FILTRO PRODUCTO */}

        <div
          className="
      flex
      items-center
      gap-2  border border-blue-200 rounded-lg p-3
    "
        >
          <input
            type="checkbox"
            title="Filtrar por producto"
            checked={useProductFilter}
            onChange={(event) => setUseProductFilter(event.target.checked)}
            className="
        cursor-help
        w-4
        h-4
      "
          />

          <div className={`flex-1`}>
            <SearchSelector
              label="Producto"
              valueName={productName}
              placeholder={
                companyId
                  ? "Seleccione un producto"
                  : "Seleccione una empresa primero"
              }
              onSearch={() => {
                if (!companyId) {
                  setWarningOpen(true);

                  return;
                }

                setProductDialogOpen(true);
              }}
            />
          </div>
        </div>

        {/* FIN FILTRO PRODUCTO */}
      </div>

      {/* FIN FILTROS */}

      <div
        className="
    grid
    grid-cols-1
    md:grid-cols-3
    gap-4 
  "
      >
        <div>
          <label
            className="
        block
        text-sm
        font-medium
        mb-1
      "
          >
            Cantidad
          </label>

          <select
            value={quantityOperator}
            onChange={(event) => setQuantityOperator(event.target.value)}
            className="
        w-full
        border
        rounded-lg
        p-3
      "
          >
            <option value="">Seleccione</option>

            <option value="=">Igual</option>

            <option value="<">Menor que</option>

            <option value="<=">Menor o igual</option>

            <option value=">">Mayor que</option>

            <option value=">=">Mayor o igual</option>

            <option value="between">Entre</option>
          </select>
        </div>

        {quantityOperator === "between" ? (
          <>
            <div>
              <label
                className="
            block
            text-sm
            font-medium
            mb-1
          "
              >
                Desde
              </label>

              <input
                type="number"
                value={quantityValue}
                onChange={(event) => setQuantityValue(event.target.value)}
                className="
            w-full
            border
            rounded-lg
            p-3
          "
              />
            </div>

            <div>
              <label
                className="
            block
            text-sm
            font-medium
            mb-1
          "
              >
                Hasta
              </label>

              <input
                type="number"
                value={quantityValue2}
                onChange={(event) => setQuantityValue2(event.target.value)}
                className="
            w-full
            border
            rounded-lg
            p-3
          "
              />
            </div>
          </>
        ) : (
          <div>
            <label
              className="
          block
          text-sm
          font-medium
          mb-1
        "
            >
              Valor
            </label>

            <input
              type="number"
              value={quantityValue}
              onChange={(event) => setQuantityValue(event.target.value)}
              className="
          w-full
          border
          rounded-lg
          p-3
        "
            />
          </div>
        )}
      </div>

      {/* ===== FIN FILTROS INVENTARIO ===== */}

      {isLoading && <div>Cargando...</div>}
      <div
        className="
    flex
    justify-end
    mb-4
  "
      >
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="
      bg-blue-600
      text-white
      px-4
      py-2
      rounded-lg
    "
        >
          ➕ Gestionar inventario
        </button>
      </div>

      <InventoryTable
        data={data?.rows ?? []}
        pagination={pagination}
        setPagination={setPagination}
        totalRows={data?.totalRows ?? 0}
        onViewMovements={(inventoryId) => {
          setMovementInventoryId(inventoryId);

          setMovementsOpen(true);
        }}
      />
      <CourierSearchDialog
        open={courierDialogOpen}
        onClose={() => setCourierDialogOpen(false)}
        onSelect={(courier) => {
          setCourierId(courier.id);

          setCourierName(courier.name);
          setUseCourierFilter(true);
        }}
      />
      <CompanySearchDialog
        open={companyDialogOpen}
        onClose={() => setCompanyDialogOpen(false)}
        onSelect={(company) => {
          setCompanyId(company.id);

          setCompanyName(company.name);
          setUseCompanyFilter(true);

          // limpiar producto
          setProductId("");

          setProductName("");
        }}
      />

      <ProductSearchDialog
        companyId={companyId}
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSelect={(product) => {
          setProductId(product.id);

          setProductName(product.name);
          setUseProductFilter(true);
        }}
      />
      <UiMessage
        open={warningOpen}
        title="
    Empresa requerida
  "
        message="
    Debe seleccionar una empresa antes de buscar productos.
  "
        type="warning"
        onClose={() => setWarningOpen(false)}
      />
      <InventoryMovementsDialog
        open={movementsOpen}
        inventoryId={movementInventoryId}
        onClose={() => setMovementsOpen(false)}
      />
      <InventoryAssignDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSave={async (data) => {
          const supabase = createClient();

          const { data: auth } = await supabase.auth.getUser();

          if (!auth.user) {
            throw new Error("Usuario no autenticado");
          }

          await assignInventory({
            ...data,

            created_by: auth.user.id,
          });

          setAssignOpen(false);

          await queryClient.invalidateQueries({
            queryKey: ["inventory"],
          });
        }}
      />
    </div>
  );
}
