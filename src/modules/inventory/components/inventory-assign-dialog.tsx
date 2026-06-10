"use client";

import { useEffect, useState } from "react";

import { SearchSelector } from "@/shared/components/search-selector";

import { CourierSearchDialog } from "@/modules/couriers/components/courier-search-dialog";

import { CompanySearchDialog } from "@/modules/companies/components/company-search-dialog";

import { ProductSearchDialog } from "@/modules/company-products/components/product-search-dialog";
import { UiMessage } from "@/shared/components/ui-message";
import { AssignInventoryInput } from "../types/assign-inventory";
type Props = {
  open: boolean;

  onClose: () => void;

  onSave: (data: Omit<AssignInventoryInput, "created_by">) => Promise<void>;
};

export function InventoryAssignDialog({
  open,

  onClose,

  onSave,
}: Props) {
  const [lowStock, setLowStock] = useState("20");
  const [messageOpen, setMessageOpen] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [mediumStock, setMediumStock] = useState("50");
  const [courierId, setCourierId] = useState("");

  const [courierName, setCourierName] = useState("");

  const [companyId, setCompanyId] = useState("");

  const [companyName, setCompanyName] = useState("");

  const [productId, setProductId] = useState("");

  const [productName, setProductName] = useState("");

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("Reposición");

  const [notes, setNotes] = useState("");

  const [courierOpen, setCourierOpen] = useState(false);

  const [companyOpen, setCompanyOpen] = useState(false);

  const [productOpen, setProductOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [movementType, setMovementType] = useState<"Entrada" | "Salida">(
    "Entrada",
  );

  {
    /* INICIO RESET MOTIVO SEGUN TIPO */
  }

  useEffect(() => {
    if (movementType === "Entrada") {
      setReason("Inventario inicial");
    } else {
      setReason("Entrega a cliente");
    }
  }, [movementType]);

  {
    /* FIN RESET MOTIVO SEGUN TIPO */
  }
  {
    /* INICIO LIMPIAR AL ABRIR */
  }

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  {
    /* FIN LIMPIAR AL ABRIR */
  }
  {
    /* INICIO RESET FORM */
  }

  function resetForm() {
    setCourierId("");

    setCourierName("");

    setCompanyId("");

    setCompanyName("");

    setProductId("");

    setProductName("");

    setQuantity("");

    setReason("Reposición");

    setNotes("");

    setLowStock("20");

    setMediumStock("50");

    setSaving(false);

    setMessageOpen(false);

    setMessageText("");
    setMovementType("Entrada");
  }

  {
    /* FIN RESET FORM */
  }
  function handleClose() {
    setCourierId("");
    setCourierName("");
    setCompanyId("");
    setCompanyName("");
    setProductId("");
    setProductName("");
    setQuantity("");
    setReason("Reposición");
    setNotes("");
    setLowStock("20");
    setMediumStock("50");
    setMessageOpen(false);
    setMessageText("");
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="
          fixed
          inset-0
          bg-black/50
          flex
          items-center
          justify-center
          z-50
          p-4
        "
      >
        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            w-full
            max-w-xl
            flex
            flex-col
            max-h-[90vh]
            overflow-hidden
          "
          onClick={(event) => event.stopPropagation()}
        >
          {/* INICIO HEADER */}
          <div
            className="
              flex
              justify-between
              items-center
              p-5
              border-b
              shrink-0
            "
          >
            <h2
              className="
                text-lg
                font-semibold
              "
            >
              Realizar ajuste de inventario
            </h2>

            <button onClick={handleClose}>✕</button>
          </div>

          {/* INICIO FORMULARIO SCROLLABLE */}

          <div
            className="
              flex
              flex-col
              gap-4
              p-5
              overflow-y-auto
              flex-1
            "
          >
            <SearchSelector
              label="Mensajero"
              valueName={courierName}
              placeholder="
                Seleccione un mensajero
              "
              onSearch={() => setCourierOpen(true)}
            />

            <SearchSelector
              label="Empresa"
              valueName={companyName}
              placeholder="
                Seleccione una empresa
              "
              onSearch={() => setCompanyOpen(true)}
            />

            <SearchSelector
              label="Producto"
              valueName={productName}
              placeholder="Seleccione un producto"
              disabled={!companyId}
              onSearch={() => setProductOpen(true)}
            />

            {/* INICIO TIPO MOVIMIENTO */}

            <div
              className="
    flex
    flex-col
  "
            >
              <label
                className="
      text-sm
      font-medium
      mb-1
    "
              >
                Tipo
              </label>

              <select
                value={movementType}
                onChange={(event) =>
                  setMovementType(event.target.value as "Entrada" | "Salida")
                }
                className={`
      border
      rounded-lg
      p-3
      font-medium

      ${
        movementType === "Entrada"
          ? `
              bg-green-50
              text-green-700
              border-green-300
            `
          : `
              bg-red-50
              text-red-700
              border-red-300
            `
      }
    `}
              >
                <option value="Entrada">🟢 Entrada</option>

                <option value="Salida">🔴 Salida</option>
              </select>
            </div>

            {/* FIN TIPO MOVIMIENTO */}

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="
                Cantidad
              "
              className="
                border
                rounded-lg
                p-3
              "
            />
            <div className="flex gap-3">
              <label className="flex flex-col gap-1 flex-1">
                <span className="text-sm text-gray-600">Bajo stock</span>
                <input
                  type="number"
                  min="0"
                  value={lowStock}
                  onChange={(event) => setLowStock(event.target.value)}
                  placeholder="0"
                  className="border rounded-lg p-3"
                />
              </label>

              <label className="flex flex-col gap-1 flex-1">
                <span className="text-sm text-gray-600">Stock medio</span>
                <input
                  type="number"
                  min="0"
                  value={mediumStock}
                  onChange={(event) => setMediumStock(event.target.value)}
                  placeholder="0"
                  className="border rounded-lg p-3"
                />
              </label>
            </div>

            {/* INICIO MOTIVO MOVIMIENTO */}

            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="
    border
    rounded-lg
    p-3
  "
            >
              {movementType === "Entrada" ? (
                <>
                  <option>Inventario inicial</option>

                  <option>Reposición de inventario</option>

                  <option>Transferencia de inventario recibida</option>

                  <option>Devolución de inventario</option>

                  <option>Inventario encontrado</option>

                  <option>Otro</option>
                </>
              ) : (
                <>
                  <option>Entrega a cliente</option>

                  <option>Inventario dañado</option>

                  <option>Inventario extraviado</option>

                  <option>Transferencia de inventario enviada</option>

                  <option>Retiro de inventario</option>

                  <option>Otro</option>
                </>
              )}
            </select>

            {/* FIN MOTIVO MOVIMIENTO */}

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Observaciones"
              rows={3}
              className="border rounded-lg p-3 resize-none"
            />
          </div>

          {/* INICIO FOOTER FIJO */}
          <div className="border-t p-4 shrink-0">
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3"
              >
                Cancelar
              </button>

              <button
                disabled={saving}
                onClick={async () => {
                  if (Number(lowStock) < 0) {
                    setMessageText(
                      "Debe ingresar un número válido para el bajo stock",
                    );

                    setMessageOpen(true);

                    return;
                  }

                  if (Number(mediumStock) <= Number(lowStock)) {
                    setMessageText(
                      "El stock medio debe ser mayor que el bajo stock",
                    );

                    setMessageOpen(true);

                    return;
                  }

                  if (!courierId) {
                    setMessageText("Debe seleccionar un mensajero");

                    setMessageOpen(true);

                    return;
                  }

                  if (!companyId) {
                    setMessageText("Debe seleccionar una empresa");

                    setMessageOpen(true);

                    return;
                  }

                  if (!productId) {
                    setMessageText("Debe seleccionar un producto");

                    setMessageOpen(true);

                    return;
                  }

                  const movementQuantity = Number(quantity);

                  if (movementQuantity <= 0) {
                    setMessageText("La cantidad debe ser mayor que cero");

                    setMessageOpen(true);

                    return;
                  }

                  setSaving(true);

                  try {
                    const signedQuantity =
                      movementType === "Salida"
                        ? -movementQuantity
                        : movementQuantity;

                    console.log("movementType:", movementType);

                    console.log("signedQuantity:", signedQuantity);

                    await onSave({
                      courier_id: courierId,

                      company_id: companyId,

                      product_id: productId,

                      quantity: signedQuantity,

                      low_stock: Number(lowStock),

                      medium_stock: Number(mediumStock),

                      reason,

                      notes,
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
                className="
    flex-1
    bg-blue-600
    text-white
    rounded-lg
    py-3
  "
              >
                Guardar
              </button>
            </div>
          </div>
          {/* FIN FOOTER FIJO */}
        </div>
      </div>

      <CourierSearchDialog
        open={courierOpen}
        onClose={() => setCourierOpen(false)}
        onSelect={(courier) => {
          setCourierId(courier.id);

          setCourierName(courier.name);
        }}
      />

      <CompanySearchDialog
        open={companyOpen}
        onClose={() => setCompanyOpen(false)}
        onSelect={(company) => {
          setCompanyId(company.id);

          setCompanyName(company.name);

          setProductId("");

          setProductName("");
        }}
      />

      <ProductSearchDialog
        companyId={companyId}
        open={productOpen}
        onClose={() => setProductOpen(false)}
        onSelect={(product) => {
          setProductId(product.id);

          setProductName(product.name);
        }}
      />
      {/* INICIO UI MESSAGE */}
      <UiMessage
        open={messageOpen}
        title="Validación"
        message={messageText}
        type="warning"
        onClose={() => {
          setMessageOpen(false);
          setMessageText("");
        }}
      />
      {/* FIN UI MESSAGE */}
    </>
  );
}
