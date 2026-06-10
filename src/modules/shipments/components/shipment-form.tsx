"use client";

import { useEffect, useState } from "react";
import type { CreateShipmentContactMethodInput } from "../types/shipment-contact-method";

import { createShipmentContactMethods } from "../api/create-shipment-contact-methods";

import { useQuery } from "@tanstack/react-query";

import { getIdentificationTypes } from "../api/get-identification-types";

import { getProvinces } from "@/modules/routes/api/get-provinces";

import { getCantons } from "@/modules/routes/api/get-cantons";

import { getDistricts } from "@/modules/routes/api/get-districts";

import { getNeighborhoods } from "@/modules/routes/api/get-neighborhoods";

import { getNeighborhoodCoverage } from "../api/get-neighborhood-coverage";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";

import { getCompanyProductsOptions } from "@/modules/company-products/api/get-company-products-options";

import type { CreateShipmentItemInput } from "../types/shipment-item";
import { createShipment } from "../api/create-shipment";

import { createShipmentItems } from "../api/create-shipment-item";
import { useRouter } from "next/navigation";

import { UiMessage } from "@/shared/components/ui-message";
import { getShipment } from "../api/get-shipment";

import { getShipmentItems } from "../api/get-shipment-items";

import { getShipmentContactMethods } from "../api/get-shipment-contact-methods";
import { updateShipment } from "../api/update-shipment";

import { replaceShipmentItems } from "../api/replace-shipment-items";

import { replaceShipmentContactMethods } from "../api/replace-shipment-contact-methods";
import { getCompanies } from "@/modules/companies/api/get-companies";

import { useSearchParams } from "next/navigation";

type Props = {
  shipmentId?: string;
};

export function ShipmentForm({ shipmentId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const copyFrom = searchParams.get("copyFrom");
  const isEditing = !!shipmentId;

  const [customerIdentificationTypeId, setCustomerIdentificationTypeId] =
    useState<number | null>(null);

  const [customerIdentification, setCustomerIdentification] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [contactMethods, setContactMethods] = useState<
    CreateShipmentContactMethodInput[]
  >([]);

  const [provinceId, setProvinceId] = useState<number | null>(null);

  const [cantonId, setCantonId] = useState<number | null>(null);

  const [districtId, setDistrictId] = useState<number | null>(null);

  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);

  const [routeId, setRouteId] = useState<string | null>(null);
  const [items, setItems] = useState<CreateShipmentItemInput[]>([]);
  const [shipmentCreated, setShipmentCreated] = useState(false);

  const [createdTrackingNumber, setCreatedTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [createdShipmentId, setCreatedShipmentId] = useState("");

  const [customerAddress, setCustomerAddress] = useState("");

  const { data: identificationTypes = [] } = useQuery({
    queryKey: ["identification-types"],

    queryFn: getIdentificationTypes,
  });
  const { data: profile } = useCurrentProfile();
  const canChooseCompany = profile?.is_owner_company_user === true;
  const { data: companiesResponse } = useQuery({
    queryKey: ["companies-selector"],

    queryFn: () =>
      getCompanies({
        pageIndex: 0,

        pageSize: 1000,
      }),

    enabled: canChooseCompany,
  });

  const copyShipmentQuery = useQuery({
    queryKey: ["copy-shipment", copyFrom],

    queryFn: () => getShipment(copyFrom!),

    enabled: !!copyFrom,
  });

  const copyItemsQuery = useQuery({
    queryKey: ["copy-items", copyFrom],

    queryFn: () => getShipmentItems(copyFrom!),

    enabled: !!copyFrom,
  });

  const copyContactsQuery = useQuery({
    queryKey: ["copy-contacts", copyFrom],

    queryFn: () => getShipmentContactMethods(copyFrom!),

    enabled: !!copyFrom,
  });

  const companies = companiesResponse?.data ?? [];

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  const effectiveCompanyId = selectedCompanyId ?? profile?.company_id ?? null;

  console.log("selectedCompanyId", selectedCompanyId);

  console.log("effectiveCompanyId", effectiveCompanyId);

  useEffect(() => {
    if (!profile || selectedCompanyId) {
      return;
    }

    setSelectedCompanyId(profile.company_id);
  }, [profile, selectedCompanyId]);

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
  });
  const { data: cantons = [] } = useQuery({
    queryKey: ["cantons", provinceId],
    queryFn: () => getCantons(provinceId!),
    enabled: provinceId !== null,
  });
  const { data: districts = [] } = useQuery({
    queryKey: ["districts", cantonId],
    queryFn: () => getDistricts(cantonId!),
    enabled: cantonId !== null,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["neighborhoods", districtId],
    queryFn: () => getNeighborhoods(districtId!),
    enabled: districtId !== null,
  });
  const { data: coverage = [] } = useQuery({
    queryKey: ["coverage", neighborhoodId],
    queryFn: () => getNeighborhoodCoverage(neighborhoodId!, districtId!),
    enabled: neighborhoodId !== null,
  });

  const { data: companyProducts = [] } = useQuery({
    queryKey: ["company-products", effectiveCompanyId],

    queryFn: () => getCompanyProductsOptions(effectiveCompanyId!),

    enabled: !!effectiveCompanyId,
  });

  console.log("companyProducts", companyProducts);
  const shipmentQuery = useQuery({
    enabled: isEditing,

    queryKey: ["shipment", shipmentId],

    queryFn: () => getShipment(shipmentId!),
  });

  const shipmentItemsQuery = useQuery({
    enabled: isEditing,

    queryKey: ["shipment-items", shipmentId],

    queryFn: () => getShipmentItems(shipmentId!),
  });

  const shipmentContactsQuery = useQuery({
    enabled: isEditing,

    queryKey: ["shipment-contact-methods", shipmentId],

    queryFn: () => getShipmentContactMethods(shipmentId!),
  });
  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState<React.ReactNode>("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info" | "question"
  >("info");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (coverage.length === 1) {
      setRouteId(coverage[0].route_id);
    }
  }, [coverage]);

  useEffect(() => {
    if (!isEditing || !shipmentQuery.data) {
      return;
    }

    const shipment = shipmentQuery.data;
    setNotes(shipment.notes ?? "");
    setCustomerIdentificationTypeId(shipment.customer_identification_type_id);

    setCustomerIdentification(shipment.customer_identification ?? "");

    setCustomerName(shipment.customer_name ?? "");

    setCustomerAddress(shipment.customer_address ?? "");

    setProvinceId(shipment.district?.canton?.province?.id ?? null);

    setCantonId(shipment.district?.canton?.id ?? null);

    setDistrictId(shipment.district?.id ?? null);

    setNeighborhoodId(shipment.neighborhood?.id ?? null);

    setRouteId(shipment.route_id);
  }, [isEditing, shipmentQuery.data]);

  useEffect(() => {
    if (!isEditing || !shipmentItemsQuery.data) {
      return;
    }

    setItems(
      shipmentItemsQuery.data.map((item) => ({
        product_id: item.product_id,

        quantity: item.quantity,

        shipping_fee: item.shipping_fee,

        deposit_amount: item.deposit_amount,
      })),
    );
  }, [isEditing, shipmentItemsQuery.data]);

  useEffect(() => {
    if (!isEditing || !shipmentContactsQuery.data) {
      return;
    }

    setContactMethods(
      shipmentContactsQuery.data.map((contact) => ({
        contact_name: contact.contact_name ?? "",

        contact_type: contact.contact_type ?? "customer",

        relationship: contact.relationship ?? undefined,

        can_receive: contact.can_receive,

        method_type: contact.method_type,

        value: contact.value,

        label: contact.label ?? undefined,

        is_primary: contact.is_primary,

        notes: contact.notes ?? undefined,
      })),
    );
  }, [isEditing, shipmentContactsQuery.data]);

  //Copia de envío existente
  useEffect(() => {
    if (!copyFrom || !copyShipmentQuery.data) {
      return;
    }

    const shipment = copyShipmentQuery.data;
    setNotes(shipment.notes ?? "");
    setCustomerIdentificationTypeId(shipment.customer_identification_type_id);

    setCustomerIdentification(shipment.customer_identification ?? "");

    setCustomerName(shipment.customer_name ?? "");

    setCustomerAddress(shipment.customer_address ?? "");
    setProvinceId(shipment.district?.canton?.province?.id ?? null);

    setCantonId(shipment.district?.canton?.id ?? null);

    setDistrictId(shipment.district_id);

    setNeighborhoodId(shipment.neighborhood_id);

    setRouteId(shipment.route_id);
    setSelectedCompanyId(shipment.company_id);
  }, [copyFrom, copyShipmentQuery.data]);

  useEffect(() => {
    if (!copyFrom || !copyItemsQuery.data) {
      return;
    }

    setItems(
      copyItemsQuery.data.map((item) => ({
        product_id: item.product_id,

        quantity: item.quantity,

        serial_number: item.serial_number ?? undefined,

        barcode: item.barcode ?? undefined,

        deposit_amount: item.deposit_amount,

        shipping_fee: item.shipping_fee,

        notes: item.notes ?? undefined,
      })),
    );
  }, [copyFrom, copyItemsQuery.data]);

  useEffect(() => {
    if (!copyFrom || !copyContactsQuery.data) {
      return;
    }

    setContactMethods(
      copyContactsQuery.data.map((contact) => ({
        contact_name: contact.contact_name ?? "",

        contact_type: contact.contact_type ?? "customer",

        relationship: contact.relationship ?? undefined,

        can_receive: contact.can_receive,

        method_type: contact.method_type,

        value: contact.value,

        label: contact.label ?? undefined,

        is_primary: contact.is_primary,

        notes: contact.notes ?? undefined,
      })),
    );
  }, [copyFrom, copyContactsQuery.data]);

  function showMessage(
    title: string,
    message: React.ReactNode,
    type: "success" | "error" | "warning" | "info" | "question" = "info",
  ) {
    setMessageTitle(title);

    setMessageText(message);

    setMessageType(type);

    setMessageOpen(true);
  }

  function addContactMethod() {
    setContactMethods((previous) => [
      ...previous,

      {
        contact_name: "",

        contact_type: "customer",

        method_type: "phone",

        value: "",

        is_primary: previous.length === 0,
      },
    ]);
  }
  function addItem() {
    setItems((previous) => [
      ...previous,

      {
        product_id: "",

        quantity: 1,

        serial_number: "",

        barcode: "",

        deposit_amount: 0,

        shipping_fee: 0,

        notes: "",
      },
    ]);
  }

  function validate() {
    if (canChooseCompany && !selectedCompanyId) {
      showMessage(
        "Empresa requerida",

        "Debe seleccionar una empresa.",

        "warning",
      );

      return false;
    }

    if (customerName.trim() === "") {
      showMessage(
        "Cliente requerido",
        "Debe ingresar el nombre del cliente.",
        "warning",
      );

      return false;
    }

    if (neighborhoodId === null) {
      showMessage("Barrio requerido", "Debe seleccionar un barrio.", "warning");

      return false;
    }

    /*if (routeId === null) {
      showMessage("Ruta requerida", "Debe seleccionar una ruta.", "warning");

      return false;
    }*/

    if (items.length === 0) {
      showMessage(
        "Productos requeridos",
        "Debe agregar al menos un producto.",
        "warning",
      );

      return false;
    }

    for (const item of items) {
      if (!item.product_id) {
        showMessage(
          "Producto incompleto",
          "Existe un producto sin seleccionar.",
          "warning",
        );

        return false;
      }

      if (item.quantity <= 0) {
        showMessage(
          "Cantidad inválida",
          "La cantidad debe ser mayor a cero.",
          "warning",
        );

        return false;
      }
    }

    return true;
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    if (!validate()) {
      return;
    }

    if (!effectiveCompanyId) {
      showMessage(
        "Empresa no encontrada",

        "No se encontró la empresa asociada al usuario.",

        "error",
      );

      return;
    }

    setSaving(true);

    try {
      const noCoverage = routeId === null;

      if (isEditing && shipmentId) {
        await updateShipment({
          shipmentId,

          company_id: canChooseCompany
            ? selectedCompanyId
            : effectiveCompanyId!,

          customer_identification_type_id: customerIdentificationTypeId,

          customer_identification: customerIdentification,

          customer_name: customerName,

          receiver_name: customerName,

          receiver_type: "owner",

          district_id: districtId,

          neighborhood_id: neighborhoodId,

          customer_address: customerAddress,

          latitude: null,

          longitude: null,

          route_id: routeId,

          internal_reference: "",

          commercial_notes: "",

          notes: notes.trim() ? notes : "",

          contact_methods: [],

          items,
        });

        await replaceShipmentItems({
          shipmentId,

          items,
        });

        await replaceShipmentContactMethods({
          shipmentId,

          methods: contactMethods,
        });

        showMessage(
          "Envío actualizado",

          noCoverage ? (
            <>
              Los cambios fueron guardados correctamente.
              <br />
              <br />
              ⚠ No existe ninguna ruta establecida para la dirección
              especificada.
              <br />
              El envío fue guardado sin ruta asignada.
            </>
          ) : (
            "Los cambios fueron guardados correctamente."
          ),

          noCoverage ? "warning" : "success",
        );
      } else {
        const shipment = await createShipment({
          company_id: canChooseCompany
            ? selectedCompanyId
            : effectiveCompanyId!,

          customer_identification_type_id: customerIdentificationTypeId,

          customer_identification: customerIdentification,

          customer_name: customerName,

          receiver_name: customerName,

          receiver_type: "owner",
          notes: notes.trim() ? notes : "",

          district_id: districtId,

          neighborhood_id: neighborhoodId,

          customer_address: customerAddress,

          latitude: null,

          longitude: null,

          route_id: routeId,

          internal_reference: "",

          commercial_notes: "",

          contact_methods: [],

          items,
        });

        await createShipmentItems({
          shipmentId: shipment.id,

          items,
        });

        await createShipmentContactMethods({
          shipmentId: shipment.id,

          methods: contactMethods,
        });

        setCreatedShipmentId(shipment.id);

        setCreatedTrackingNumber(shipment.tracking_number);

        setShipmentCreated(true);

        showMessage(
          noCoverage ? "Envío creado sin ruta" : "Envío creado",

          noCoverage ? (
            <>
              La guía {shipment.tracking_number} fue creada correctamente.
              <br />
              <br />
              ⚠ No existe ninguna ruta establecida para la dirección
              especificada.
              <br />
              El envío fue creado sin ruta asignada.
            </>
          ) : (
            `La guía ${shipment.tracking_number} fue creada correctamente.`
          ),

          noCoverage ? "warning" : "success",
        );
      }

      setTimeout(() => {
        router.push("/dashboard/shipments/list");
      }, 1500);
    } catch (error) {
      console.error(error);

      showMessage(
        "Error",

        isEditing
          ? "Ocurrió un error actualizando el envío."
          : "Ocurrió un error creando el envío.",

        "error",
      );
    } finally {
      setSaving(false);
    }
  }
  function resetForm() {
    setCustomerIdentificationTypeId(null);

    setCustomerIdentification("");

    setCustomerName("");

    setProvinceId(null);

    setCantonId(null);

    setDistrictId(null);

    setNeighborhoodId(null);

    setRouteId(null);

    setCustomerAddress("");

    setItems([]);
  }

  return (
    <div className="max-w-[400px] mx-auto border border-blue-300 rounded-xl p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        {isEditing
          ? `Editar envío ${shipmentQuery.data?.tracking_number ?? ""}`
          : "Nuevo envío"}
      </h1>

      {canChooseCompany && (
        <div
          className="
      mb-4
    "
        >
          <label
            className="
        block
        mb-1
        font-medium
      "
          >
            Empresa
          </label>

          <select
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="
        w-full
        border
        rounded-xl
        p-2
      "
          >
            <option value="">Seleccione una empresa</option>

            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tipo de identificación */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Tipo de identificación
        </label>
        <select
          value={customerIdentificationTypeId ?? ""}
          onChange={(e) =>
            setCustomerIdentificationTypeId(Number(e.target.value))
          }
          className="w-full border rounded-xl p-3"
        >
          <option value="">Seleccione un tipo</option>
          {identificationTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Identificación */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Identificación
        </label>
        <input
          value={customerIdentification}
          onChange={(e) => setCustomerIdentification(e.target.value)}
          placeholder="Ingrese su identificación"
          className="w-full border rounded-xl p-3"
        />
      </div>

      {/* Nombre */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Nombre del cliente
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Ingrese el nombre"
          className="w-full border rounded-xl p-3"
        />
      </div>

      {/* Contenedor dirección */}
      <div className="border border-blue-200 rounded-xl p-4 space-y-3">
        <label className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
          Dirección de entrega
        </label>

        {/* Provincia */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 w-20 shrink-0">
            Provincia:
          </label>
          <select
            value={provinceId ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setProvinceId(value);
              setCantonId(null);
              setDistrictId(null);
              setNeighborhoodId(null);
              setRouteId(null);
            }}
            className="flex-1 border rounded-xl p-2"
          >
            <option value="">Seleccione</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cantón */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 w-20 shrink-0">
            Cantón:
          </label>
          <select
            value={cantonId ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setCantonId(value);
              setDistrictId(null);
              setNeighborhoodId(null);
              setRouteId(null);
            }}
            disabled={provinceId === null}
            className="flex-1 border rounded-xl p-2 disabled:opacity-50"
          >
            <option value="">Seleccione</option>
            {cantons.map((canton) => (
              <option key={canton.id} value={canton.id}>
                {canton.name}
              </option>
            ))}
          </select>
        </div>

        {/* Distrito */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 w-20 shrink-0">
            Distrito:
          </label>
          <select
            value={districtId ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setDistrictId(value);
              setNeighborhoodId(null);
              setRouteId(null);
            }}
            disabled={cantonId === null}
            className="flex-1 border rounded-xl p-2 disabled:opacity-50"
          >
            <option value="">Seleccione</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Barrio */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 w-20 shrink-0">
            Barrio:
          </label>
          <select
            value={neighborhoodId ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setNeighborhoodId(value);
              setRouteId(null);
            }}
            disabled={districtId === null}
            className="flex-1 border rounded-xl p-2 disabled:opacity-50"
          >
            <option value="">Seleccione</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Dirección exacta
          </label>

          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            rows={3}
            placeholder="200 metros norte de..., casa color..., local..."
            className="w-full border rounded-xl p-3"
          />
        </div>
      </div>
      {coverage.length > 0 && (
        <div className="border rounded-xl p-4 space-y-3">
          <div className="font-bold text-lg">Seleccione una ruta</div>
          {routeId && (
            <div className="rounded-lg bg-green-50 border border-green-300 p-3">
              <span className="font-semibold text-green-700">
                Ruta seleccionada:
              </span>{" "}
              {coverage.find((route) => route.route_id === routeId)?.route_name}
            </div>
          )}
          <div className="text-sm text-gray-500">
            Se encontraron {coverage.length} rutas para este barrio.
          </div>

          {coverage.map((route) => (
            <button
              key={route.route_id}
              type="button"
              onClick={() => setRouteId(route.route_id)}
              className={
                routeId === route.route_id
                  ? `
                w-full
                rounded-xl
                p-4
                text-left
                border-4
                border-blue-600
                bg-blue-50
                shadow-md
              `
                  : `
                w-full
                rounded-xl
                p-4
                text-left
                border
                hover:border-blue-400
              `
              }
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">
                    {route.route_name}
                  </div>

                  {route.min_hours === 0 && route.max_hours === 0 ? (
                    <>
                      <div className="text-sm font-medium text-gray-700 mt-1">
                        Cronograma
                      </div>

                      <div className="flex gap-2 mt-2">
                        {[
                          "sunday",
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                        ].map((day) => {
                          const active = route.visit_days.includes(day);

                          const label = {
                            sunday: "D",

                            monday: "L",

                            tuesday: "M",

                            wednesday: "X",

                            thursday: "J",

                            friday: "V",

                            saturday: "S",
                          }[day];

                          return (
                            <span
                              key={day}
                              className={
                                active
                                  ? "font-bold text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 mt-1">
                      {route.max_hours === 0
                        ? `${route.min_hours} horas`
                        : `${route.min_hours} - ${route.max_hours} horas`}
                    </div>
                  )}
                </div>

                {routeId === route.route_id && (
                  <div className="flex flex-col items-end">
                    <div className="text-blue-700 font-bold text-lg">✓</div>

                    <div className="text-xs text-blue-700 font-semibold">
                      Seleccionada
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Contenedor contactos */}
      <div
        className="
    border
    border-blue-300
    rounded-xl
    p-4
    space-y-3
  "
      >
        <div
          className="
      flex
      justify-between
      items-center
    "
        >
          <div
            className="
        font-bold
        text-lg
      "
          >
            Contactos
          </div>

          <button
            type="button"
            onClick={addContactMethod}
            className="
        px-3
        py-2
        rounded-lg
        bg-green-600
        text-white
      "
          >
            + Agregar
          </button>
        </div>

        {contactMethods.map((contact, index) => (
          <div
            key={index}
            className="
    border
    rounded-xl
    p-3
    space-y-2
  "
          >
            <div
              className="
      flex
      justify-between
      items-center
    "
            >
              <div
                className="
        text-sm
        font-semibold
        text-gray-500
      "
              >
                Contacto #{index + 1}
              </div>

              <button
                type="button"
                onClick={() => {
                  setContactMethods((previous) =>
                    previous.filter(
                      (_, currentIndex) => currentIndex !== index,
                    ),
                  );
                }}
                className="
        px-3
        py-1
        rounded-lg
        bg-red-500
        text-white
        text-xs
        font-medium
      "
              >
                ✕ Eliminar
              </button>
            </div>
            <input
              value={contact.contact_name}
              onChange={(e) => {
                const updated = [...contactMethods];

                updated[index] = {
                  ...updated[index],

                  contact_name: e.target.value,
                };

                setContactMethods(updated);
              }}
              placeholder="Nombre contacto"
              className="
            w-full
            border
            rounded-xl
            p-2
          "
            />

            <select
              value={contact.method_type}
              onChange={(e) => {
                const updated = [...contactMethods];

                updated[index] = {
                  ...updated[index],

                  method_type: e.target.value as "phone" | "whatsapp" | "email",
                };

                setContactMethods(updated);
              }}
              className="
            w-full
            border
            rounded-xl
            p-2
          "
            >
              <option value="phone">Teléfono</option>

              <option value="whatsapp">WhatsApp</option>

              <option value="email">Email</option>
            </select>

            <input
              value={contact.value}
              onChange={(e) => {
                const updated = [...contactMethods];

                updated[index] = {
                  ...updated[index],

                  value: e.target.value,
                };

                setContactMethods(updated);
              }}
              placeholder="Número o correo"
              className="
            w-full
            border
            rounded-xl
            p-2
          "
            />

            <div
              className="
    flex
    items-center
    gap-2
  "
            >
              <input
                type="checkbox"
                checked={contact.is_primary ?? false}
                onChange={() => {
                  const updated = contactMethods.map(
                    (current, currentIndex) => ({
                      ...current,

                      is_primary: currentIndex === index,
                    }),
                  );

                  setContactMethods(updated);
                }}
              />

              <span
                className="
      text-sm
      text-gray-700
    "
              >
                Contacto principal
              </span>
              <div
                className="
    flex
    items-center
    gap-2
  "
              >
                <input
                  type="checkbox"
                  checked={contact.can_receive ?? false}
                  onChange={(e) => {
                    const updated = [...contactMethods];

                    updated[index] = {
                      ...updated[index],

                      can_receive: e.target.checked,
                    };

                    setContactMethods(updated);
                  }}
                />

                <span
                  className="
      text-sm
      text-gray-700
    "
                >
                  Puede recibir el envío
                </span>
              </div>
            </div>

            <textarea
              value={contact.notes ?? ""}
              onChange={(e) => {
                const updated = [...contactMethods];

                updated[index] = {
                  ...updated[index],

                  notes: e.target.value,
                };

                setContactMethods(updated);
              }}
              rows={2}
              placeholder="
    Observaciones
    (opcional)
  "
              className="
    w-full
    border
    rounded-xl
    p-2
    resize-none
  "
            />
          </div>
        ))}
      </div>
      {/*fin al del contenedor contactos*/}

      <div className="border border-blue-300 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg">¿Qué desea enviar?</div>
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium"
          >
            + Agregar
          </button>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50"
          >
            {/* Encabezado del item */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">
                Artículo #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, i) => i !== index))}
                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium"
              >
                ✕ Eliminar
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1 col-span-3">
                <label className="text-sm font-medium text-gray-700">
                  Producto
                </label>
                <select
                  value={item.product_id}
                  onChange={(e) => {
                    const product = companyProducts.find(
                      (p) => p.id === e.target.value,
                    );
                    const updated = [...items];
                    updated[index] = {
                      ...updated[index],
                      product_id: e.target.value,
                      deposit_amount: product?.default_deposit ?? 0,
                      shipping_fee: product?.default_shipping_fee ?? 0,
                    };
                    setItems(updated);
                  }}
                  className="w-full border rounded-xl px-2 py-2"
                >
                  <option value="">Seleccione</option>
                  {companyProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Cant.
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantity === 0 ? "" : item.quantity}
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-", "."].includes(e.key) &&
                    e.preventDefault()
                  }
                  onChange={(e) => {
                    const updated = [...items];

                    updated[index] = {
                      ...updated[index],
                      quantity: Number(e.target.value) || 0,
                    };

                    setItems(updated);
                  }}
                  placeholder="0"
                  className="
    w-full
    border
    rounded-xl
    p-2
  "
                />
              </div>
            </div>

            {/* Depósito + Costo envío en la misma fila */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Depósito (₡)
                </label>
                <input
                  type="number"
                  min={0}
                  step="1000"
                  value={item.deposit_amount === 0 ? "" : item.deposit_amount}
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                  }
                  onChange={(e) => {
                    const updated = [...items];

                    updated[index] = {
                      ...updated[index],
                      deposit_amount: Number(e.target.value) || 0,
                    };

                    setItems(updated);
                  }}
                  placeholder="0"
                  className="w-full border rounded-xl p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Costo envío (₡)
                </label>
                <input
                  type="number"
                  min={0}
                  step="1000"
                  value={item.shipping_fee === 0 ? "" : item.shipping_fee}
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                  }
                  onChange={(e) => {
                    const updated = [...items];

                    updated[index] = {
                      ...updated[index],
                      shipping_fee: Number(e.target.value) || 0,
                    };

                    setItems(updated);
                  }}
                  placeholder="0"
                  className="w-full border rounded-xl p-2"
                />
              </div>
            </div>

            {/* Serie + Código barras en la misma fila */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  N° Serie
                </label>
                <input
                  value={item.serial_number}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[index] = {
                      ...updated[index],
                      serial_number: e.target.value,
                    };
                    setItems(updated);
                  }}
                  placeholder="Opcional"
                  className="w-full border rounded-xl p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Código barras
                </label>
                <input
                  value={item.barcode}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[index] = {
                      ...updated[index],
                      barcode: e.target.value,
                    };
                    setItems(updated);
                  }}
                  placeholder="Opcional"
                  className="w-full border rounded-xl p-2"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea
                value={item.notes}
                onChange={(e) => {
                  const updated = [...items];
                  updated[index] = { ...updated[index], notes: e.target.value };
                  setItems(updated);
                }}
                rows={2}
                placeholder="Notas adicionales sobre este producto..."
                className="w-full border rounded-xl p-2 resize-none"
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No hay artículos agregados. Presione <strong>+ Agregar</strong> para
            comenzar.
          </div>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Observaciones/Notas
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="
      Ej:
      Cliente trabaja después de las 2pm.
      Entregar únicamente al titular.
      Casa color verde.
    "
          className="
      w-full
      border
      rounded-xl
      p-3
    "
        />
      </div>
      <button
        disabled={saving}
        type="button"
        onClick={handleSave}
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
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
