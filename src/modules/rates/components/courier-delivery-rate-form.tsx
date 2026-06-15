"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getProvinces } from "@/modules/routes/api/get-provinces";

import { getCantons } from "@/modules/routes/api/get-cantons";

import { getDistricts } from "@/modules/routes/api/get-districts";

import { getNeighborhoods } from "@/modules/routes/api/get-neighborhoods";

import { UiMessage } from "@/shared/components/ui-message";

import { createCourierDeliveryRate } from "../api/create-courier-delivery-rate";

import { updateCourierDeliveryRate } from "../api/update-courier-delivery-rate";
type Props = {
  open: boolean;

  routeId: string;

  courierId: string;

  rate?: any | null;

  onClose: () => void;

  onSaved: () => void;
};

export function CourierDeliveryRateForm({
  open,

  routeId,

  courierId,

  rate,

  onClose,

  onSaved,
}: Props) {
  const [level, setLevel] = useState("route");

  const [provinceId, setProvinceId] = useState<number | null>(null);

  const [cantonId, setCantonId] = useState<number | null>(null);

  const [districtId, setDistrictId] = useState<number | null>(null);

  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);

  const [deliveryPay, setDeliveryPay] = useState("");

  const [failedPay, setFailedPay] = useState("");

  const [saving, setSaving] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

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

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!rate) {
      resetForm();

      return;
    }

    setProvinceId(rate.province_id);

    setCantonId(rate.canton_id);

    setDistrictId(rate.district_id);

    setNeighborhoodId(rate.neighborhood_id);

    setDeliveryPay(String(rate.delivery_pay));

    setFailedPay(String(rate.failed_pay));

    if (rate.neighborhood_id) {
      setLevel("neighborhood");
    } else if (rate.district_id) {
      setLevel("district");
    } else if (rate.canton_id) {
      setLevel("canton");
    } else if (rate.province_id) {
      setLevel("province");
    } else {
      setLevel("route");
    }
  }, [open, rate]);

  function resetForm() {
    setLevel("route");

    setProvinceId(null);

    setCantonId(null);

    setDistrictId(null);

    setNeighborhoodId(null);

    setDeliveryPay("");

    setFailedPay("");
  }
  async function handleSave() {
    try {
      setSaving(true);

      const payload = {
        courier_id: courierId,

        route_id: routeId,

        province_id:
          level === "province" ||
          level === "canton" ||
          level === "district" ||
          level === "neighborhood"
            ? provinceId
            : null,

        canton_id:
          level === "canton" || level === "district" || level === "neighborhood"
            ? cantonId
            : null,

        district_id:
          level === "district" || level === "neighborhood" ? districtId : null,

        neighborhood_id: level === "neighborhood" ? neighborhoodId : null,

        delivery_pay: Number(deliveryPay),

        failed_pay: Number(failedPay),
      };

      if (rate) {
        await updateCourierDeliveryRate(
          rate.id,

          payload,
        );
      } else {
        await createCourierDeliveryRate(payload);
      }

      onSaved();
    } catch (error: any) {
      console.error(error);

      if (error?.code === "23505") {
        setMessageType("warning");

        setMessageTitle("Tarifa duplicada");

        setMessageText(
          `
Ya existe una tarifa configurada para esta combinación de ruta y zona.

Puede modificar la tarifa existente en lugar de crear una nueva.
      `,
        );
      } else {
        setMessageType("error");

        setMessageTitle("Error");

        setMessageText("No fue posible guardar la tarifa.");
      }

      setMessageOpen(true);
    } finally {
      setSaving(false);
    }
  }
  if (!open) {
    return null;
  }

  return (
    <div
      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/50
    "
    >
      <div
        className="
        bg-white
        rounded-xl
        shadow-xl
        w-full
        max-w-2xl
        max-h-[90vh]
        overflow-y-auto
      "
      >
        <div
          className="
          flex
          justify-between
          items-center
          border-b
          p-4
        "
        >
          <h2
            className="
            text-xl
            font-bold
          "
          >
            {rate ? "Modificar tarifa de pago a Mensajero" : "Nueva tarifa de pago a Mensajero"}
          </h2>

          <button
            onClick={onClose}
            className="
            text-gray-500
            hover:text-black
          "
          >
            ✕
          </button>
        </div>

        <div
          className="
          p-4
          space-y-4
        "
        >
          <div>
            <label className="block mb-1">Nivel</label>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="
              w-full
              border
              rounded-xl
              p-2
            "
            >
              <option value="route">Toda la ruta</option>

              <option value="province">Provincia</option>

              <option value="canton">Cantón</option>

              <option value="district">Distrito</option>

              <option value="neighborhood">Barrio</option>
            </select>
          </div>

          {level !== "route" && (
            <div>
              <label className="block mb-1">Provincia</label>

              <select
                value={provinceId ?? ""}
                onChange={(e) => setProvinceId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "canton" ||
            level === "district" ||
            level === "neighborhood") && (
            <div>
              <label className="block mb-1">Cantón</label>

              <select
                value={cantonId ?? ""}
                onChange={(e) => setCantonId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {cantons.map((canton) => (
                  <option key={canton.id} value={canton.id}>
                    {canton.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "district" || level === "neighborhood") && (
            <div>
              <label className="block mb-1">Distrito</label>

              <select
                value={districtId ?? ""}
                onChange={(e) => setDistrictId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {level === "neighborhood" && (
            <div>
              <label className="block mb-1">Barrio</label>

              <select
                value={neighborhoodId ?? ""}
                onChange={(e) => setNeighborhoodId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1">Pago por entrega</label>

            <input
              type="number"
              value={deliveryPay}
              onChange={(e) => setDeliveryPay(e.target.value)}
              className="
              w-full
              border
              rounded-xl
              p-2
            "
            />
          </div>

          <div>
            <label className="block mb-1">Pago por intento fallido</label>

            <input
              type="number"
              value={failedPay}
              onChange={(e) => setFailedPay(e.target.value)}
              className="
              w-full
              border
              rounded-xl
              p-2
            "
            />
          </div>
        </div>

        <div
          className="
          border-t
          p-4
          flex
          justify-end
          gap-2
        "
        >
          <button
            onClick={onClose}
            className="
            px-4
            py-2
            border
            rounded-xl
          "
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="
    px-4
    py-2
    bg-blue-600
    text-white
    rounded-xl
    disabled:opacity-50
  "
          >
            {saving
              ? "Guardando..."
              : rate
                ? "Actualizar tarifa"
                : "Guardar tarifa"}
          </button>
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
