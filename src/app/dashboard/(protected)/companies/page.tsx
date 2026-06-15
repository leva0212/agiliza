"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { UiMessage } from "@/shared/components/ui-message";
import { getCompanyById } from "@/modules/companies/api/get-company-by-id";
import { updateCompany } from "@/modules/companies/api/update-company";
import { createCompany } from "@/modules/companies/api/create-company";
import { ContactMethodsEditor } from "@/modules/contacts/components/contact-methods-editor";
import { getProducts } from "@/modules/products/api/get-products";
import { saveCompanyProducts } from "@/modules/company-products/api/save-company-products";
import { getSelectedProductIds } from "@/modules/company-products/api/get-selected-product-ids";
import { propagateCompanyRates } from "@/modules/rates/api/propagate-company-rates";
export default function CompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [propagateOpen, setPropagateOpen] = useState(false);
  const [propagating, setPropagating] = useState(false);

  const companyId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPosition, setContactPosition] = useState("");
  const [active, setActive] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState("0");

  const [failedCharge, setFailedCharge] = useState("0");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [primaryContactId, setPrimaryContactId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadCompany() {
      const allProducts = await getProducts();
      setProducts(allProducts);

      if (!companyId) {
        return;
      }

      const company = await getCompanyById(companyId);
      const selectedIds = await getSelectedProductIds(companyId);

      setSelectedProducts(selectedIds);
      setCode(company.code || "");
      setName(company.name || "");
      setTradeName(company.trade_name || "");
      setAddress(company.address || "");
      setActive(company.active);
      setContactName(company.primary_contact?.full_name || "");
      setContactPosition(company.primary_contact?.position || "");
      setDeliveryCharge(String(company.delivery_charge ?? 0));

      setFailedCharge(String(company.failed_charge ?? 0));
      setPrimaryContactId(company.primary_contact?.id || "");
    }

    loadCompany();
  }, [companyId]);

  async function handleSave() {
    try {
      if (companyId) {
        console.log({
          deliveryCharge,
          failedCharge,
        });
        await updateCompany({
          id: companyId,

          code,

          name,

          tradeName,

          address,

          contactName,

          contactPosition,

          active,

          deliveryCharge: Number(deliveryCharge),

          failedCharge: Number(failedCharge),
        });

        await saveCompanyProducts(companyId, selectedProducts);

        await queryClient.invalidateQueries({
          queryKey: ["companies"],
        });

        setMessageTitle("Empresa actualizada");

        setMessageText("La empresa se actualizó correctamente.");

        setMessageType("success");

        setMessageOpen(true);
      } else {
        const company = await createCompany({
          code,

          name,

          tradeName,

          address,

          contactName,

          contactPosition,

          active,

          deliveryCharge: Number(deliveryCharge),

          failedCharge: Number(failedCharge),
        });

        await saveCompanyProducts(
          company.id,

          selectedProducts,
        );

        await queryClient.invalidateQueries({
          queryKey: ["companies"],
        });

        setMessageTitle("Empresa creada");

        setMessageText("La empresa se creó correctamente.");

        setMessageType("success");

        setMessageOpen(true);

        setTimeout(() => {
          router.push(`/dashboard/companies?id=${company.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error(error);

      setMessageTitle("Error");

      setMessageText("No fue posible guardar la empresa.");

      setMessageType("error");

      setMessageOpen(true);
    }
  }

  return (
    <div className="max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-6">Empresa</h1>

      <div className="bg-white rounded-xl border p-6 max-w-[600px]">
        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Código</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre legal
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre comercial
            </label>
            <input
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dirección</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contacto principal
            </label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cargo</label>
            <input
              value={contactPosition}
              onChange={(e) => setContactPosition(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Activa
            </label>
            <div
              className="
    border
    rounded-lg
    p-4
  "
            >
              <h3
                className="
      text-lg
      font-bold
      mb-4
    "
              >
                Tarifas DTS
              </h3>

              <div
                className="
      grid
      gap-4
    "
              >
                <div>
                  <label
                    className="
          block
          text-sm
          font-medium
          mb-2
        "
                  >
                    Cobro entrega
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
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
          mb-2
        "
                  >
                    Cobro intento fallido
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={failedCharge}
                    onChange={(e) => setFailedCharge(e.target.value)}
                    className="
          w-full
          border
          rounded-lg
          p-3
        "
                  />
                </div>

                {companyId && (
                  <button
                    type="button"
                    disabled={propagating}
                    onClick={() => setPropagateOpen(true)}
                    className="
    bg-violet-600
    hover:bg-violet-700
    text-white
    px-4
    py-3
    rounded-lg
    disabled:opacity-50
  "
                  >
                    {propagating
                      ? "Propagando..."
                      : "Propagar a todas las rutas"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/companies/list")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {primaryContactId && (
        <div className="mt-8">
          <ContactMethodsEditor contactId={primaryContactId} />
        </div>
      )}

      <div className="border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-bold mb-4">Productos habilitados</h3>
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <label key={product.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts((previous) => [
                      ...previous,
                      product.id,
                    ]);
                  } else {
                    setSelectedProducts((previous) =>
                      previous.filter((id) => id !== product.id),
                    );
                  }
                }}
              />
              {product.name}
            </label>
          ))}
        </div>
      </div>
      <UiMessage
        open={propagateOpen}
        type="question"
        title="
    Propagar tarifas
  "
        message={
          <>
            <p>
              ¿Desea guardar la configuración actual y propagarla a todas las
              rutas?
            </p>
            <br />

            <p>
              Se crearán o actualizarán únicamente las tarifas de nivel
              <strong> Toda la ruta</strong>.
            </p>

            <br />

            <p>
              Las tarifas específicas por provincia, cantón, distrito o barrio
              no serán modificadas.
            </p>
          </>
        }
        confirmText="
    Propagar
  "
        cancelText="
    Cancelar
  "
        onClose={() => setPropagateOpen(false)}
        onConfirm={async () => {

  if (
    !companyId
  ) {
    return;
  }

  setPropagateOpen(
    false,
  );

  setPropagating(
    true,
  );

  try {

    await updateCompany({

      id:
        companyId,

      code,

      name,

      tradeName,

      address,

      contactName,

      contactPosition,

      active,

      deliveryCharge:
        Number(
          deliveryCharge,
        ),

      failedCharge:
        Number(
          failedCharge,
        ),

    });

    await saveCompanyProducts(

      companyId,

      selectedProducts,

    );

    await propagateCompanyRates({

      companyId,

      deliveryCharge:
        Number(
          deliveryCharge,
        ),

      failedCharge:
        Number(
          failedCharge,
        ),

    });

    await queryClient.invalidateQueries({

      queryKey: [
        "companies",
      ],

    });

    setMessageTitle(
      "Configuración propagada",
    );

    setMessageText(
      "La empresa fue actualizada y las tarifas fueron propagadas correctamente.",
    );

    setMessageType(
      "success",
    );

    setMessageOpen(
      true,
    );

  } catch (
    error
  ) {

    console.error(
      error,
    );

    setMessageTitle(
      "Error",
    );

    setMessageText(
      "No fue posible propagar las tarifas.",
    );

    setMessageType(
      "error",
    );

    setMessageOpen(
      true,
    );

  } finally {

    setPropagating(
      false,
    );

  }

}}
      />

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
