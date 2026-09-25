"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";

import { InventoryTable } from "@/modules/inventory/components/inventory-table";

import { useInventory } from "@/modules/inventory/hooks/use-inventory";
import { SearchSelector } from "@/shared/components/search-selector";

import { CourierSearchDialog } from "@/modules/couriers/components/courier-search-dialog";
import { ProductSearchDialog } from "@/modules/company-products/components/product-search-dialog";
import { CompanySearchDialog } from "@/modules/companies/components/company-search-dialog";
import { UiMessage } from "@/shared/components/ui-message";
import { AppBarActionButton, AppBarActions } from "@/shared/components/app-bar-actions";
import { InventoryMovementsDialog } from "@/modules/inventory/components/inventory-movements-dialog";
import { InventoryAssignDialog } from "@/modules/inventory/components/inventory-assign-dialog";
import { AssignInventoryInput } from "@/modules/inventory/types/assign-inventory";
import type { Inventory } from "@/modules/inventory/types/inventory";
import { updateInventoryAlertLevels } from "@/modules/inventory/api/update-inventory-alert-levels";
import { useQueryClient } from "@tanstack/react-query";

import { assignInventory } from "@/modules/inventory/api/assign-inventory";

import { createClient } from "@/lib/supabase/client";
export default function InventoryListPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageIndex: 0,

    pageSize: 10,
  });
  const [alertInventory, setAlertInventory] = useState<Inventory | null>(null);
  const [alertLow, setAlertLow] = useState("");
  const [alertMedium, setAlertMedium] = useState("");
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertHelpOpen, setAlertHelpOpen] = useState(false);
  const [movementInventoryId, setMovementInventoryId] = useState<string | null>(
    null,
  );

  const [useCourierFilter, setUseCourierFilter] = useState(false);

  const [useCompanyFilter, setUseCompanyFilter] = useState(false);

  const [useProductFilter, setUseProductFilter] = useState(false);

  const [movementsOpen, setMovementsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [movementInventory, setMovementInventory] = useState<Inventory | null>(null);
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
  const [stockStatus, setStockStatus] = useState<"low" | "medium" | "high" | undefined>();


  const { data, isLoading, error } = useInventory({
    pageIndex: pagination.pageIndex,

    pageSize: pagination.pageSize,

    courierId: useCourierFilter ? courierId : undefined,

    companyId: useCompanyFilter ? companyId : undefined,

    productId: useProductFilter ? productId : undefined,

    quantityOperator: quantityOperator as any,

    quantityValue: quantityValue ? Number(quantityValue) : undefined,

    quantityValue2: quantityValue2 ? Number(quantityValue2) : undefined,
    stockStatus,
  });

  const alertHasChanges = !!alertInventory && (Number(alertLow) !== alertInventory.low_stock || Number(alertMedium) !== alertInventory.medium_stock);

  const toggleStockStatus = (nextStatus: "low" | "medium" | "high") => {
    setStockStatus(stockStatus === nextStatus ? undefined : nextStatus);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  if (error) {
    return <div className="p-6">Error al cargar inventario</div>;
  }


  return (
    <div className="space-y-5 p-2">
      <AppBarActions><AppBarActionButton label="Cómo funcionan los niveles de alerta" onClick={() => setAlertHelpOpen(true)}><CircleHelp size={20} /></AppBarActionButton></AppBarActions>
      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Filtros</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Busca inventarios por mensajero, empresa, producto o cantidad. Marca la casilla para aplicar cada filtro.</p>
        </div>
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

      </section>

      {isLoading && <div>Cargando...</div>}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => toggleStockStatus("low")} className={`rounded-xl border p-4 text-left transition ${stockStatus === "low" ? "ring-2 ring-red-500" : ""} border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30`}>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Existencias bajas</p><p className="mt-1 text-3xl font-bold text-red-700 dark:text-red-200">{data?.summary.lowRecords ?? 0}</p><p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">{data?.summary.lowCouriers ?? 0} mensajeros · {data?.summary.lowProducts ?? 0} productos</p>
        </button>
        <button type="button" onClick={() => toggleStockStatus("medium")} className={`rounded-xl border p-4 text-left transition ${stockStatus === "medium" ? "ring-2 ring-amber-500" : ""} border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30`}>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Existencias medias</p><p className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-200">{data?.summary.mediumRecords ?? 0}</p><p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">Haz clic para filtrar la tabla</p>
        </button>
        <button type="button" onClick={() => toggleStockStatus("high")} className={`rounded-xl border p-4 text-left transition ${stockStatus === "high" ? "ring-2 ring-green-500" : ""} border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/30`}>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Existencias altas</p><p className="mt-1 text-3xl font-bold text-green-700 dark:text-green-200">{data?.summary.highRecords ?? 0}</p><p className="mt-1 text-xs text-green-700/80 dark:text-green-300/80">Haz clic para filtrar la tabla</p>
        </button>
        <button type="button" onClick={() => toggleStockStatus("low")} className={`rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-left transition hover:bg-cyan-100 dark:border-cyan-900 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 ${stockStatus === "low" ? "ring-2 ring-cyan-500" : ""}`}><p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Monitor de bajo stock</p><p className="mt-1 text-2xl font-bold text-cyan-800 dark:text-cyan-100">{data?.summary.lowCompanies ?? 0} empresas</p><p className="mt-1 text-xs text-cyan-700/80 dark:text-cyan-300/80">Haz clic para verlas en la tabla</p></button>
      </section>
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
          ➕ Registrar movimiento
        </button>
      </div>

      <InventoryTable
        data={data?.rows ?? []}
        pagination={pagination}
        setPagination={setPagination}
        totalRows={data?.totalRows ?? 0}
        summary={data?.summary ?? { totalQuantity: 0, totalRecords: 0, lowRecords: 0, mediumRecords: 0, highRecords: 0, lowCouriers: 0, lowCompanies: 0, lowProducts: 0 }}
        onConfigureAlerts={(inventory) => { setAlertInventory(inventory); setAlertLow(String(inventory.low_stock)); setAlertMedium(String(inventory.medium_stock)); }}
        onRegisterMovement={(inventory) => { setMovementInventory(inventory); setAssignOpen(true); }}
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
      <UiMessage open={alertHelpOpen} title="Niveles de alerta" type="info" message={<div className="space-y-3"><p>Cada inventario se configura por <strong>mensajero, empresa y producto</strong>.</p><p><span className="font-semibold text-red-600 dark:text-red-400">Rojo · Bajo:</span> cantidad menor que <span className="font-semibold text-red-600 dark:text-red-400">existencias bajas</span>.</p><p><span className="font-semibold text-amber-600 dark:text-amber-400">Ámbar · Medio:</span> desde el nivel bajo y menor que <span className="font-semibold text-amber-600 dark:text-amber-400">existencias medias</span>.</p><p><span className="font-semibold text-emerald-600 dark:text-emerald-400">Verde · Alto:</span> igual o mayor que <span className="font-semibold text-emerald-600 dark:text-emerald-400">existencias medias</span>.</p><p>Los valores negativos también se consideran <span className="font-semibold text-red-600 dark:text-red-400">bajos</span>.</p></div>} onClose={() => setAlertHelpOpen(false)} />
      {alertInventory && <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-white p-5 shadow-2xl dark:bg-slate-900"><h2 className="text-lg font-semibold">Niveles de alerta</h2><div className="mt-2 space-y-0.5 text-sm text-slate-600 dark:text-slate-400"><p><span className="font-medium text-slate-800 dark:text-slate-200">Producto:</span> {alertInventory.product_name}</p><p><span className="font-medium text-slate-800 dark:text-slate-200">Empresa:</span> {alertInventory.company_name}</p><p><span className="font-medium text-slate-800 dark:text-slate-200">Mensajero:</span> {alertInventory.courier_name}</p></div><div className="mt-4 flex flex-col gap-3"><label className="text-sm font-medium">Existencias bajas<input type="number" min="0" value={alertLow} onChange={(e) => setAlertLow(e.target.value)} className="mt-1 w-full rounded-lg border p-3 dark:bg-slate-950" /></label><label className="text-sm font-medium">Existencias medias<input type="number" min="0" value={alertMedium} onChange={(e) => setAlertMedium(e.target.value)} className="mt-1 w-full rounded-lg border p-3 dark:bg-slate-950" /></label></div><div className="mt-5 flex gap-3"><button type="button" onClick={() => setAlertInventory(null)} className="flex-1 rounded-lg border py-2">Cancelar</button><button type="button" disabled={alertSaving || !alertHasChanges} onClick={async () => { const low=Number(alertLow), medium=Number(alertMedium); if (!alertHasChanges) return; if (!Number.isInteger(low) || low < 0 || !Number.isInteger(medium) || medium <= low) { setWarningOpen(true); return; } setAlertSaving(true); try { await updateInventoryAlertLevels({ id: alertInventory.id, lowStock: low, mediumStock: medium }); setAlertInventory(null); await queryClient.invalidateQueries({ queryKey: ["inventory"] }); } catch { setWarningOpen(true); } finally { setAlertSaving(false); } }} className="flex-1 rounded-lg bg-blue-600 py-2 text-white">{alertSaving ? "Guardando…" : alertHasChanges ? "Guardar" : "Sin cambios"}</button></div></div></div>}      <InventoryMovementsDialog
        open={movementsOpen}
        inventoryId={movementInventoryId}
        onClose={() => setMovementsOpen(false)}
      />
      <InventoryAssignDialog
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setMovementInventory(null); }}
        initialCourier={movementInventory ? { id: movementInventory.courier_id, name: movementInventory.courier_name ?? "" } : courierId && courierName ? { id: courierId, name: courierName } : undefined}
        initialCompany={movementInventory ? { id: movementInventory.company_id, name: movementInventory.company_name ?? "" } : companyId && companyName ? { id: companyId, name: companyName } : undefined}
        initialProduct={movementInventory ? { id: movementInventory.product_id, name: movementInventory.product_name ?? "" } : productId && productName ? { id: productId, name: productName } : undefined}
        lockSelection={!!movementInventory}
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
