"use client";

import { useEffect, useState } from "react";

import { SearchSelector } from "@/shared/components/search-selector";
import { CourierSearchDialog } from "@/modules/couriers/components/courier-search-dialog";
import { CompanySearchDialog } from "@/modules/companies/components/company-search-dialog";
import { ProductSearchDialog } from "@/modules/company-products/components/product-search-dialog";
import { UiMessage } from "@/shared/components/ui-message";
import { AssignInventoryInput } from "../types/assign-inventory";

type Selection = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<AssignInventoryInput, "created_by">) => Promise<void>;
  initialCourier?: Selection;
  initialCompany?: Selection;
  initialProduct?: Selection;
  lockSelection?: boolean;
};

export function InventoryAssignDialog({
  open,
  onClose,
  onSave,
  initialCourier,
  initialCompany,
  initialProduct,
  lockSelection = false,
}: Props) {
  const [lowStock, setLowStock] = useState("20");
  const [mediumStock, setMediumStock] = useState("50");
  const [courierId, setCourierId] = useState("");
  const [courierName, setCourierName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Reposición de inventario");
  const [notes, setNotes] = useState("");
  const [courierOpen, setCourierOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [movementType, setMovementType] = useState<"Entrada" | "Salida">("Entrada");

  useEffect(() => {
    if (!open) return;

    setCourierId(initialCourier?.id ?? "");
    setCourierName(initialCourier?.name ?? "");
    setCompanyId(initialCompany?.id ?? "");
    setCompanyName(initialCompany?.name ?? "");
    setProductId(initialProduct?.id ?? "");
    setProductName(initialProduct?.name ?? "");
    setQuantity("");
    setLowStock("20");
    setMediumStock("50");
    setMovementType("Entrada");
    setReason("Reposición de inventario");
    setNotes("");
    setSaving(false);
    setMessageOpen(false);
    setMessageText("");
  }, [open, initialCourier, initialCompany, initialProduct]);

  useEffect(() => {
    setReason(movementType === "Entrada" ? "Reposición de inventario" : "Retiro de inventario");
  }, [movementType]);

  function handleClose() {
    if (!saving) onClose();
  }

  async function handleSave() {
    if (!courierId || !companyId || !productId) {
      setMessageText("Seleccione mensajero, empresa y producto antes de registrar el movimiento.");
      setMessageOpen(true);
      return;
    }

    const movementQuantity = Number(quantity);
    if (!Number.isInteger(movementQuantity) || movementQuantity <= 0) {
      setMessageText("La cantidad debe ser un número entero mayor que cero.");
      setMessageOpen(true);
      return;
    }

    if (!Number.isInteger(Number(lowStock)) || Number(lowStock) < 0) {
      setMessageText("El nivel de existencias bajas debe ser un número entero igual o mayor que cero.");
      setMessageOpen(true);
      return;
    }

    if (!Number.isInteger(Number(mediumStock)) || Number(mediumStock) <= Number(lowStock)) {
      setMessageText("El nivel medio debe ser un número entero mayor que el nivel de existencias bajas.");
      setMessageOpen(true);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        courier_id: courierId,
        company_id: companyId,
        product_id: productId,
        quantity: movementType === "Salida" ? -movementQuantity : movementQuantity,
        low_stock: Number(lowStock),
        medium_stock: Number(mediumStock),
        reason,
        notes: notes.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const fieldClass = "w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  return (
    <>
      <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4" onClick={handleClose}>
        <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Registrar movimiento de inventario</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Suma o resta existencias y deja el motivo registrado en el historial.</p>
            </div>
            <button type="button" onClick={handleClose} disabled={saving} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Cerrar">✕</button>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/70 dark:bg-blue-950/20">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Destino del movimiento</h3>
              <p className="mb-3 mt-1 text-xs text-slate-600 dark:text-slate-400">Los valores seleccionados en los filtros se cargan aquí para continuar más rápido.</p>
              <div className="flex flex-col gap-3">
                <SearchSelector label="Mensajero" valueName={courierName} placeholder="Seleccione un mensajero" disabled={lockSelection} onSearch={() => setCourierOpen(true)} />
                <SearchSelector label="Empresa propietaria del producto" valueName={companyName} placeholder="Seleccione una empresa" disabled={lockSelection} onSearch={() => setCompanyOpen(true)} />
                <SearchSelector label="Producto" valueName={productName} placeholder={companyId ? "Seleccione un producto" : "Seleccione una empresa primero"} disabled={lockSelection || !companyId} onSearch={() => setProductOpen(true)} />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Ajuste</h3>
              <p className="mb-3 mt-1 text-xs text-slate-600 dark:text-slate-400">Una entrada suma existencias; una salida las resta. Una salida puede dejar saldo negativo para regularizarlo después.</p>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tipo de movimiento
                  <select value={movementType} onChange={(event) => setMovementType(event.target.value as "Entrada" | "Salida")} className={`${fieldClass} ${movementType === "Entrada" ? "border-green-400 text-green-700 dark:text-green-300" : "border-red-400 text-red-700 dark:text-red-300"}`}>
                    <option value="Entrada">Entrada: sumar existencias</option>
                    <option value="Salida">Salida: restar existencias</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cantidad a {movementType === "Entrada" ? "sumar" : "restar"}
                  <input type="number" inputMode="numeric" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Ejemplo: 10" className={fieldClass} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Motivo del movimiento
                  <select value={reason} onChange={(event) => setReason(event.target.value)} className={fieldClass}>
                    {movementType === "Entrada" ? <><option>Inventario inicial</option><option>Reposición de inventario</option><option>Transferencia de inventario recibida</option><option>Devolución de inventario</option><option>Inventario encontrado</option><option>Otro</option></> : <><option>Entrega a cliente</option><option>Inventario dañado</option><option>Inventario extraviado</option><option>Transferencia de inventario enviada</option><option>Retiro de inventario</option><option>Otro</option></>}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Observaciones <span className="font-normal text-slate-500">(opcional)</span>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ejemplo: ajuste por conteo físico" rows={3} className={`${fieldClass} resize-none`} />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-amber-300/70 bg-amber-50/60 p-4 dark:border-amber-700/50 dark:bg-amber-950/20">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Niveles de alerta</h3>
              <p className="mb-3 mt-1 text-xs text-slate-600 dark:text-slate-400">Sirven para clasificar el saldo como bajo, medio o alto. Se guardan para esta combinación de mensajero, empresa y producto.</p>
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">Existencias bajas<input type="number" min="0" step="1" value={lowStock} onChange={(event) => setLowStock(event.target.value)} className={fieldClass} /></label>
                <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">Existencias medias<input type="number" min="0" step="1" value={mediumStock} onChange={(event) => setMediumStock(event.target.value)} className={fieldClass} /></label>
              </div>
            </section>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
            <button type="button" onClick={handleClose} disabled={saving} className="flex-1 rounded-lg border border-slate-300 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</button>
            <button type="button" disabled={saving} onClick={handleSave} className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Registrando…" : `Registrar ${movementType.toLowerCase()}`}</button>
          </div>
        </div>
      </div>

      <CourierSearchDialog open={courierOpen} onClose={() => setCourierOpen(false)} onSelect={(courier) => { setCourierId(courier.id); setCourierName(courier.name); }} />
      <CompanySearchDialog open={companyOpen} onClose={() => setCompanyOpen(false)} onSelect={(company) => { setCompanyId(company.id); setCompanyName(company.name); setProductId(""); setProductName(""); }} />
      <ProductSearchDialog companyId={companyId} open={productOpen} onClose={() => setProductOpen(false)} onSelect={(product) => { setProductId(product.id); setProductName(product.name); }} />
      <UiMessage open={messageOpen} title="Revisa el ajuste" message={messageText} type="warning" onClose={() => { setMessageOpen(false); setMessageText(""); }} />
    </>
  );
}
