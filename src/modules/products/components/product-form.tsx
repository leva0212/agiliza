"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { UiMessage } from "@/shared/components/ui-message";

import { createProduct } from "@/modules/products/api/create-product";

import { updateProduct } from "@/modules/products/api/update-product";

import { getProductById } from "@/modules/products/api/get-product-by-id";

type ProductFormProps = {
  productId?: string;
};

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");

  const [sku, setSku] = useState("");

  const [defaultDeposit, setDefaultDeposit] = useState("");

  const [defaultShippingFee, setDefaultShippingFee] = useState("");

  const [notes, setNotes] = useState("");

  const [active, setActive] = useState(true);

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        return;
      }

      const product = await getProductById(productId);

      setName(product.name ?? "");

      setSku(product.sku ?? "");

      setDefaultDeposit(String(product.default_deposit ?? ""));

      setDefaultShippingFee(String(product.default_shipping_fee ?? ""));

      setNotes(product.notes ?? "");

      setActive(product.active);
    }

    loadProduct();
  }, [productId]);

  async function handleSave() {
    try {
      if (productId) {
        await updateProduct({
          id: productId,

          name,

          sku,

          notes,

          active,

          defaultDeposit: defaultDeposit ? Number(defaultDeposit) : null,

          defaultShippingFee: defaultShippingFee
            ? Number(defaultShippingFee)
            : null,
        });

        await queryClient.invalidateQueries({
          queryKey: ["products"],
        });

        setMessageTitle("Producto actualizado");

        setMessageText("El producto se actualizó correctamente.");
      } else {
        const product = await createProduct({
          name,

          sku,

          notes,

          active,

          defaultDeposit: defaultDeposit ? Number(defaultDeposit) : null,

          defaultShippingFee: defaultShippingFee
            ? Number(defaultShippingFee)
            : null,
        });

        await queryClient.invalidateQueries({
          queryKey: ["products"],
        });

        setMessageTitle("Producto creado");

        setMessageText("El producto se creó correctamente.");

        setTimeout(
          () => {
            router.push(`/dashboard/products/edit/${product.id}`);
          },

          1500,
        );
      }

      setMessageType("success");

      setMessageOpen(true);
    } catch (error) {
      console.error(error);

      setMessageTitle("Error");

      setMessageText("No fue posible guardar el producto.");

      setMessageType("error");

      setMessageOpen(true);
    }
  }

  return (
    <div className="max-w-[600px] p-6">
      <h1 className="text-2xl font-bold mb-6">Producto</h1>

      <div className="bg-white rounded-xl border p-6 max-w-[700px]">
        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>

            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Depósito sugerido
            </label>

            <input
              //type="number"
              type="text"
              inputMode="numeric"
              value={defaultDeposit}
              onChange={(e) => setDefaultDeposit(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Envío sugerido
            </label>

            <input
              //type="number"
              type="text"
              inputMode="numeric"
              value={defaultShippingFee}
              onChange={(e) => setDefaultShippingFee(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notas</label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={4}
            />
          </div>

          <div>
            <label className="flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Activo
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Guardar
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/products/list")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  );
}
